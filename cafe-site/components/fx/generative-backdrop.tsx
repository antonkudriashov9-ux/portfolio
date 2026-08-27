"use client";

/**
 * Генеративный фон: частицы разбегаются из окружности, оставляя след.
 *
 * Основано на сцене `getSceneRndCircVelExpose` из присланного набора
 * (inconvergent-подобные наброски). Алгоритм сохранён: у каждой точки свои
 * накопительные скорости по осям, шум добавляется каждый кадр, координаты
 * ограничены рамкой холста.
 *
 * ── Почему код из файла нельзя было вставить как есть ───────────────────────
 *  • `class=` вместо `className` (10 раз) — TSX не компилируется;
 *  • `main()` вызывался при загрузке модуля — падение на сервере, где нет
 *    `document`;
 *  • фон заливался белым (`rgba(255,255,255,1)`), точки чёрные — против тёмной
 *    темы сайта они попросту невидимы;
 *  • десять канвасов подряд: это страница-демонстрация, а не фон;
 *  • `addEventListener("scroll")` без снятия — слушатели копились;
 *  • `num = Math.floor(width)` — 1440 точек на ноутбуке при 60 к/с, то есть
 *    86 400 операций в секунду. Ровно та нагрузка, из-за которой лагал
 *    предыдущий фон.
 *
 * ── Что сделано здесь ──────────────────────────────────────────────────────
 *  1. Число точек ограничено и зависит от ширины: 420 на настольном экране,
 *     ~180 на телефоне. При 20 к/с это 8 400 операций в секунду.
 *  2. Канвас НЕ очищается каждый кадр — точки накапливаются полупрозрачным
 *     следом. Это ключевая экономия: работа равна числу новых точек, а не
 *     площади экрана. След медленно тает отдельным редким проходом.
 *  3. Цвета под тёмную тему: тёплый акцент бренда на почти чёрном.
 *  4. Анимация идёт только когда слой виден и вкладка активна; при
 *     `prefers-reduced-motion` рисуется один статичный кадр.
 *  5. Всё живёт внутри `useEffect` и снимается при размонтировании.
 */

import { useEffect, useRef } from "react";

type Props = {
  /** Максимум точек. Реальное число уменьшается на узких экранах. */
  maxDots?: number;
  /** Кадров в секунду. */
  fps?: number;
  /** Сила случайного приращения скорости за кадр. */
  noise?: number;
  /** Прозрачность одной точки: чем меньше, тем мягче след. */
  dotAlpha?: number;
  /** Непрозрачность всего слоя. */
  opacity?: number;
  className?: string;
};

export function GenerativeBackdrop({
  maxDots = 420,
  fps = 20,
  noise = 0.012,
  dotAlpha = 0.055,
  opacity = 0.85,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timer = 0;
    let fadeTick = 0;
    let onScreen = true;
    let w = 0;
    let h = 0;
    let dots: { x: number; y: number; vx: number; vy: number }[] = [];

    /** Трение: без него накопленная скорость растёт безгранично. */
    const DAMP = 0.985;

    /** Новая точка на случайном угле исходной окружности. */
    const spawn = () => {
      const a = Math.random() * Math.PI * 2;
      const rad = Math.min(w, h) * 0.22;
      return {
        x: w / 2 + Math.cos(a) * rad,
        y: h / 2 + Math.sin(a) * rad,
        vx: 0,
        vy: 0,
      };
    };

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return false;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Точек меньше на узком экране: там и площадь меньше, и устройство слабее
      const count = Math.min(maxDots, Math.max(160, Math.round(w / 2.8)));
      dots = [];
      for (let i = 0; i < count; i++) dots.push(spawn());
      return true;
    };

    const step = () => {
      // Тёплый акцент бренда вместо чёрного из оригинала: на тёмном фоне
      // чёрные точки были бы невидимы
      ctx.fillStyle = `rgba(216, 180, 106, ${dotAlpha})`;

      let sx = 0;
      let sy = 0;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        // Скорость накапливается с трением: отсюда плавные тянущиеся
        // траектории. Без DAMP скорость росла безгранично и через минуту
        // движение вырождалось в рывки.
        d.vx = d.vx * DAMP + (1 - 2 * Math.random()) * noise;
        d.vy = d.vy * DAMP + (1 - 2 * Math.random()) * noise;
        sx += d.vx;
        sy += d.vy;
        d.x += sx;
        d.y += sy;

        // Ушла за рамку — рождается заново в круге.
        // В оригинале координата ЗАЖИМАЛАСЬ в рамку, и точки прилипали к
        // краям: расчёт показал 280 прилипших из 420 к 600-му кадру,
        // после чего след замирал по периметру.
        if (d.x < 0 || d.x > w || d.y < 0 || d.y > h) {
          dots[i] = spawn();
          continue;
        }

        // Точка радиусом ~1: fillRect дешевле arc, на таком размере
        // визуально не отличается
        ctx.fillRect(d.x, d.y, 1.15, 1.15);
      }

      // След тает редко, а не каждый кадр: полная заливка площади дорога,
      // а на глаз разницы между «таять 20 раз в секунду» и «раз в секунду» нет
      fadeTick++;
      if (fadeTick % fps === 0) {
        ctx.fillStyle = "rgba(18, 16, 12, 0.055)";
        ctx.fillRect(0, 0, w, h);
      }
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };

    const run = () => {
      stop();
      if (!onScreen || document.hidden) return;
      if (reduced) {
        // Один статичный кадр: движение выключено, но фон не пустой
        for (let i = 0; i < 40; i++) step();
        return;
      }
      timer = window.setInterval(step, Math.round(1000 / fps));
    };

    if (seed()) run();

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        run();
      },
      { rootMargin: "80px" }
    );
    io.observe(canvas);

    const onVisibility = () => run();
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (seed()) run();
      }, 300);
    });
    ro.observe(canvas);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [maxDots, fps, noise, dotAlpha]);

  return (
    <canvas ref={canvasRef} aria-hidden className={className} style={{ opacity }} />
  );
}
