"use client";

/**
 * Живой фон из фотографии, разложенной в ASCII-сетку на Canvas2D.
 *
 * ── Почему написано именно так ──────────────────────────────────────────────
 * Первая версия лагала. Замер объяснил причину: 16 000 ячеек × 2 прохода
 * аберрации × 24 к/с = 768 000 вызовов fillText в секунду, при разумном
 * пределе порядка 5-10 тысяч. Расчёт «по ячейкам, а не по пикселям» сам по
 * себе нагрузку не снимает — дорога именно отрисовка глифов.
 *
 * Что сделано, по убыванию эффекта:
 *
 * 1. Глифы рисуются ОДИН раз в атлас (по картинке на уровень яркости), а
 *    каждый кадр выполняется только drawImage. Нет разбора шрифта и
 *    растеризации на каждую ячейку.
 * 2. Перерисовываются ТОЛЬКО ячейки, у которых сменился уровень яркости.
 *    Мерцание слабое, поэтому за кадр меняется малая доля сетки — вместо
 *    полной перерисовки идут точечные обновления.
 * 3. Ячейка крупнее (14 px): площадь растёт квадратично, число ячеек падает
 *    во столько же раз.
 * 4. Аберрация — сдвиг ГОТОВОГО кадра в двух цветовых слоях средствами CSS,
 *    а не второй проход по всей сетке.
 * 5. Шум на ячейку считается один раз в таблицу, а не Math.sin каждый кадр.
 * 6. Анимация останавливается, когда слой вне экрана (IntersectionObserver) и
 *    когда вкладка неактивна: невидимый фон не должен занимать процессор.
 * 7. prefers-reduced-motion — один статичный кадр: движение гаснет, картинка
 *    остаётся.
 */

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  /** Сторона ячейки в пикселях. Меньше — детальнее и дороже. */
  cellSize?: number;
  /** Сила мерцания, 0–100. */
  animIntensity?: number;
  /** Скорость мерцания, 0–100. */
  animSpeed?: number;
  /** Непрозрачность слоя. */
  opacity?: number;
  className?: string;
};

// От плотного к разреженному: индекс = уровень яркости
const CHARS = "@%#*+=-:. ";
// Число уровней в атласе: больше — плавнее переходы и больше памяти.
// 10 хватает — глаз не различает больше на фоне под вуалью.
const LEVELS = CHARS.length;

export function AsciiBackdrop({
  src,
  cellSize = 14,
  animIntensity = 30,
  animSpeed = 80,
  opacity = 0.4,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let cols = 0;
    let rows = 0;
    let lum = new Float32Array(0);      // яркость ячейки из фотографии
    let noiseTable = new Float32Array(0); // устойчивый шум на ячейку
    let shown = new Int8Array(0);        // какой уровень уже нарисован
    let atlas: HTMLCanvasElement[] = [];
    let ready = false;
    let visible = true;
    let last = 0;
    const FRAME_MS = 1000 / 20; // 20 к/с: мерцание плавное, нагрузка ниже

    const img = new Image();
    img.decoding = "async";

    /** Атлас глифов: по одной картинке на уровень яркости. */
    const buildAtlas = (dpr: number) => {
      atlas = [];
      const size = Math.ceil(cellSize * dpr);
      for (let i = 0; i < LEVELS; i++) {
        const tile = document.createElement("canvas");
        tile.width = size;
        tile.height = size;
        const t = tile.getContext("2d");
        if (!t) continue;
        const ch = CHARS[i];
        if (ch !== " ") {
          t.scale(dpr, dpr);
          t.font = `${cellSize}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
          t.textBaseline = "top";
          // Яркость зашита в сам глиф: чем плотнее символ, тем он ярче.
          // Так за кадр не приходится трогать globalAlpha.
          const a = 0.22 + (1 - i / (LEVELS - 1)) * 0.78;
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

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(1, Math.ceil(w / cellSize));
      rows = Math.max(1, Math.ceil(h / cellSize));

      buildAtlas(dpr);

      // Фотография сжимается до размера сетки: один её пиксель = средняя
      // яркость ячейки, усреднять вручную не нужно
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
      noiseTable = new Float32Array(n);
      shown = new Int8Array(n).fill(-1);

      for (let i = 0, p = 0; i < n; i++, p += 4) {
        // Светимость по коэффициентам восприятия: простое среднее делает
        // зелёные блики темнее, чем их видит глаз
        lum[i] =
          (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
        const v = Math.sin(i * 12.9898) * 43758.5453;
        noiseTable[i] = v - Math.floor(v);
      }
      return true;
    };

    const levelOf = (i: number, t: number) => {
      const flick = reduced
        ? 0
        : Math.sin(t + noiseTable[i] * 6.283) * (animIntensity / 100) * 0.4;
      const l = lum[i] * (1 + flick) + 0.03;
      if (l < 0.06) return LEVELS - 1; // пробел
      return Math.min(LEVELS - 1, Math.max(0, Math.floor((1 - l) * (LEVELS - 1))));
    };

    const render = (now: number) => {
      if (!ready || !visible) return;
      if (now - last < FRAME_MS) {
        raf = requestAnimationFrame(render);
        return;
      }
      last = now;

      // Общая фаза мерцания: считается ОДИН раз на кадр, не на ячейку
      const t = (now / 1000) * (animSpeed / 100) * 2.2;

      for (let y = 0, i = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++, i++) {
          const lv = levelOf(i, t);
          if (lv === shown[i]) continue; // ячейка не изменилась — не трогаем

          const px = x * cellSize;
          const py = y * cellSize;
          ctx.clearRect(px, py, cellSize, cellSize);
          if (lv !== LEVELS - 1) {
            ctx.drawImage(atlas[lv], px, py, cellSize, cellSize);
          }
          shown[i] = lv;
        }
      }

      if (!reduced) raf = requestAnimationFrame(render);
    };

    const start = () => {
      ready = measure();
      if (!ready) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };

    img.onload = start;
    img.onerror = () => {
      ready = false; // молча оставляем штатный фон страницы
    };
    img.src = src;

    // Вне экрана и в неактивной вкладке анимация останавливается:
    // невидимый фон не должен занимать процессор
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && ready) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (ready && visible) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      // Пересборка атласа и сетки дорога — не дёргаем её на каждый пиксель
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (img.complete && img.naturalWidth) start();
      }, 250);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [src, cellSize, animIntensity, animSpeed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        opacity,
        // Аберрация сдвигом готового кадра, а не вторым проходом по сетке:
        // цена — один фильтр на слой вместо удвоения отрисовок
        filter:
          "drop-shadow(-1px 0 0 rgba(216,180,106,0.30)) drop-shadow(1px 0 0 rgba(120,190,210,0.22))",
      }}
    />
  );
}
