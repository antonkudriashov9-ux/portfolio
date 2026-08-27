"use client";

/**
 * Живой фон из фотографии, разложенной в ASCII-сетку на Canvas2D.
 *
 * ── История правок (чтобы не наступить снова) ───────────────────────────────
 *
 * Версия 1 лагала: 16 000 ячеек × 2 прохода × 24 к/с = 768 000 вызовов
 * fillText в секунду при разумном пределе 5-10 тысяч.
 *
 * Версия 2 (атлас глифов + перерисовка только изменившихся ячеек) снизила это
 * до ~3 400 операций, но лаги остались. Нашлись две причины, которые арифметика
 * отрисовки не покрывала:
 *   • слой `position: fixed` виден ВСЕГДА, поэтому IntersectionObserver его не
 *     отключал никогда — анимация шла и на первом экране, поверх которого и так
 *     работают видео/слайдер и девять motion-элементов;
 *   • `filter: drop-shadow(...)` на элемент размером во весь экран — это полная
 *     повторная композиция кадра средствами GPU на КАЖДЫЙ кадр.
 *
 * Версия 3 (эта):
 *   1. Анимация идёт только когда фон реально нужен — за это отвечает внешний
 *      признак `active`, который страница выставляет по прокрутке. На первом
 *      экране рисуется один статичный кадр и цикл не запускается вовсе.
 *   2. `filter` убран. Аберрация делается ОДИН раз при построении атласа:
 *      глиф в атласе уже нарисован тремя смещёнными копиями. Стоимость — ноль
 *      кадров, эффект тот же.
 *   3. Кадры считаются по таймеру, а не через requestAnimationFrame: 12 к/с
 *      достаточно для мерцания, а браузер не пытается уложиться в 60.
 *   4. Ограничение сетки: не больше MAX_CELLS ячеек. На большом мониторе
 *      ячейка автоматически крупнее, а не растёт число операций.
 */

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  /** Желаемая сторона ячейки. Может быть увеличена, чтобы уложиться в MAX_CELLS. */
  cellSize?: number;
  /** Сила мерцания, 0–100. 0 — статичная текстура. */
  animIntensity?: number;
  /** Кадров в секунду для мерцания. */
  fps?: number;
  /** Непрозрачность слоя. */
  opacity?: number;
  /**
   * Нужна ли анимация. Страница выставляет false, пока виден первый экран:
   * там свои видео и анимации, фону незачем с ними конкурировать.
   * При false рисуется один статичный кадр.
   */
  active?: boolean;
  className?: string;
};

const CHARS = "@%#*+=-:. ";
const LEVELS = CHARS.length;
/** Потолок числа ячеек: на 4K ячейка станет крупнее, но работы не прибавится. */
const MAX_CELLS = 7000;

export function AsciiBackdrop({
  src,
  cellSize = 14,
  animIntensity = 26,
  fps = 12,
  opacity = 0.4,
  active = true,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);

  // Признак держим в ref: менять его не должно пересобирать сетку и атлас
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timer = 0;
    let cols = 0;
    let rows = 0;
    let cell = cellSize;
    let lum = new Float32Array(0);
    let noise = new Float32Array(0);
    let shown = new Int8Array(0);
    let atlas: HTMLCanvasElement[] = [];
    let ready = false;
    let onScreen = true;
    let frame = 0;

    const img = new Image();
    img.decoding = "async";

    /**
     * Атлас глифов. Аберрация запечена здесь: три смещённые копии символа в
     * тёплом, холодном и основном цвете. Раньше это делалось CSS-фильтром на
     * весь экран каждый кадр — самая дорогая часть прошлой версии.
     */
    const buildAtlas = (dpr: number) => {
      atlas = [];
      const size = Math.ceil(cell * dpr);
      for (let i = 0; i < LEVELS; i++) {
        const tile = document.createElement("canvas");
        tile.width = size;
        tile.height = size;
        const t = tile.getContext("2d");
        if (!t) continue;
        const ch = CHARS[i];
        if (ch !== " ") {
          t.scale(dpr, dpr);
          t.font = `${cell}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
          t.textBaseline = "top";
          const a = 0.2 + (1 - i / (LEVELS - 1)) * 0.8;
          // холодный и тёплый ореолы — те самые доли пикселя аберрации
          t.fillStyle = `rgba(120, 190, 210, ${(a * 0.3).toFixed(3)})`;
          t.fillText(ch, 0.8, 0);
          t.fillStyle = `rgba(216, 180, 106, ${(a * 0.35).toFixed(3)})`;
          t.fillText(ch, -0.8, 0);
          t.fillStyle = `rgba(216, 180, 106, ${a.toFixed(3)})`;
          t.fillText(ch, 0, 0);
        }
        atlas.push(tile);
      }
    };

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return false;

      // Ячейку увеличиваем, если иначе ячеек будет слишком много.
      // На большом экране сетка крупнее — работы столько же.
      cell = cellSize;
      while (Math.ceil(w / cell) * Math.ceil(h / cell) > MAX_CELLS) cell += 2;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(1, Math.ceil(w / cell));
      rows = Math.max(1, Math.ceil(h / cell));

      buildAtlas(dpr);

      const sampler = document.createElement("canvas");
      sampler.width = cols;
      sampler.height = rows;
      const sctx = sampler.getContext("2d", { willReadFrequently: true });
      if (!sctx) return false;

      const scale = Math.max(cols / img.width, rows / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      sctx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);

      const data = sctx.getImageData(0, 0, cols, rows).data;
      const n = cols * rows;
      lum = new Float32Array(n);
      noise = new Float32Array(n);
      shown = new Int8Array(n).fill(-1);

      for (let i = 0, p = 0; i < n; i++, p += 4) {
        lum[i] =
          (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
        const v = Math.sin(i * 12.9898) * 43758.5453;
        noise[i] = v - Math.floor(v);
      }
      return true;
    };

    const levelOf = (i: number, phase: number) => {
      const flick =
        phase === 0 ? 0 : Math.sin(phase + noise[i] * 6.283) * (animIntensity / 100) * 0.4;
      const l = lum[i] * (1 + flick) + 0.03;
      if (l < 0.06) return LEVELS - 1;
      return Math.min(LEVELS - 1, Math.max(0, Math.floor((1 - l) * (LEVELS - 1))));
    };

    const paint = (phase: number) => {
      for (let y = 0, i = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++, i++) {
          const lv = levelOf(i, phase);
          if (lv === shown[i]) continue; // не изменилась — не трогаем
          const px = x * cell;
          const py = y * cell;
          ctx.clearRect(px, py, cell, cell);
          if (lv !== LEVELS - 1) ctx.drawImage(atlas[lv], px, py, cell, cell);
          shown[i] = lv;
        }
      }
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };

    const tick = () => {
      if (!ready || !onScreen || document.hidden || !activeRef.current) return;
      frame++;
      paint((frame / fps) * 1.8);
    };

    const run = () => {
      stop();
      if (!ready) return;
      // Статичный кадр рисуем всегда: фон не должен быть пустым
      paint(0);
      const animate = !reduced && activeRef.current && onScreen && !document.hidden;
      // setInterval, а не requestAnimationFrame: 12 к/с достаточно для
      // мерцания, и браузер не пытается уложиться в 60
      if (animate) timer = window.setInterval(tick, Math.round(1000 / fps));
    };

    img.onload = () => {
      ready = measure();
      run();
    };
    img.onerror = () => {
      ready = false; // молча оставляем штатный фон
    };
    img.src = src;

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        run();
      },
      { rootMargin: "100px" }
    );
    io.observe(canvas);

    const onVisibility = () => run();
    document.addEventListener("visibilitychange", onVisibility);

    // Признак active меняется прокруткой — цикл нужно пересобрать
    const poll = window.setInterval(() => {
      const shouldRun = !reduced && activeRef.current && onScreen && !document.hidden;
      if (shouldRun !== timer > 0) run();
    }, 400);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (img.complete && img.naturalWidth) {
          ready = measure();
          run();
        }
      }, 300);
    });
    ro.observe(canvas);

    return () => {
      stop();
      window.clearInterval(poll);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [src, cellSize, animIntensity, fps]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      // filter намеренно НЕ используется: drop-shadow на элемент во весь экран
      // заставлял GPU пересобирать кадр целиком. Аберрация запечена в атлас.
      style={{ opacity }}
    />
  );
}
