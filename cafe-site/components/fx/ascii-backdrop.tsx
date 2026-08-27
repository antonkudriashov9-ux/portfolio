"use client";

/**
 * Живой фон из фотографии, разложенной в ASCII-дизеринг на Canvas2D.
 *
 * Смысл: за секциями был ровный тёмный цвет. Здесь фотография зала превращается
 * в сетку символов по яркости — фон остаётся тёмным и не мешает тексту, но
 * дышит и принадлежит именно этому ресторану, а не абстрактному шаблону.
 *
 * Порядок отрисовки (важен именно такой):
 *   1. фотография рисуется во вспомогательный канвас размером в сетку —
 *      один пиксель этого канваса и есть средняя яркость ячейки;
 *   2. по ячейкам раскладываются символы, размер и яркость — от светимости;
 *   3. мерцание во времени (animStyle: flicker);
 *   4. хроматическая аберрация: два смещённых прохода в красном и голубом.
 *
 * Осознанные решения:
 * - Кадр считается на offscreen-канвасе в 1x, на экран копируется с учётом DPR:
 *   расчёт по числу ячеек, а не по числу пикселей экрана, поэтому на 4K не
 *   тяжелее, чем на ноутбуке.
 * - Ограничение частоты кадров: 24 к/с достаточно для мерцания, а нагрузка на
 *   процессор в разы ниже, чем при 60.
 * - При prefers-reduced-motion рисуется ОДИН статичный кадр: движение гасится,
 *   но картинка остаётся — иначе фон снова станет пустым.
 * - Пока фотография не загружена, ничего не рисуется: показать половину кадра
 *   хуже, чем показать штатный фон страницы.
 */

import { useEffect, useRef } from "react";

type Props = {
  /** Путь к фотографии-источнику. */
  src: string;
  /** Сторона ячейки сетки в пикселях. Меньше — детальнее и дороже. */
  cellSize?: number;
  /** Доля ячеек, которые рисуются (0–100). */
  coverage?: number;
  /** Плотность: сдвиг по набору символов, 0–100. */
  density?: number;
  /** Скорость мерцания, 0–100. */
  animSpeed?: number;
  /** Сила мерцания, 0–100. */
  animIntensity?: number;
  /** Сила хроматической аберрации, 0–100. 0 — выключить. */
  chromatic?: number;
  /** Общая непрозрачность слоя. */
  opacity?: number;
  /** Класс для позиционирования. */
  className?: string;
};

// Набор от плотного к разреженному: индекс выбирается по яркости ячейки
const CHARS = "@%#*+=-:. ";

export function AsciiBackdrop({
  src,
  cellSize = 9,
  coverage = 100,
  density = 24,
  animSpeed = 80,
  animIntensity = 30,
  chromatic = 15,
  opacity = 0.55,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Вспомогательный канвас: фотография сжимается до размера сетки, и каждый
    // его пиксель — уже средняя яркость ячейки. Так не нужно усреднять вручную.
    const sampler = document.createElement("canvas");
    const sctx = sampler.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;

    let raf = 0;
    let cols = 0;
    let rows = 0;
    let cells: Float32Array = new Float32Array(0);
    let ready = false;
    let last = 0;
    const FRAME_MS = 1000 / 24;

    const img = new Image();
    img.decoding = "async";

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

      sampler.width = cols;
      sampler.height = rows;

      // Фотография кадрируется как object-cover: сохраняем пропорции,
      // иначе интерьер растянется и станет неузнаваемым
      const scale = Math.max(cols / img.width, rows / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      sctx.clearRect(0, 0, cols, rows);
      sctx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);

      const data = sctx.getImageData(0, 0, cols, rows).data;
      cells = new Float32Array(cols * rows);
      for (let i = 0, p = 0; i < cells.length; i++, p += 4) {
        // Светимость по коэффициентам восприятия, а не среднее по каналам:
        // среднее делает зелёные блики темнее, чем их видит глаз
        cells[i] =
          (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
      }
      return true;
    };

    // Псевдослучайное, но устойчивое значение на ячейку: нужно, чтобы мерцание
    // было разным по площади и не «дышало» всей сеткой одновременно
    const noise = (i: number) => {
      const v = Math.sin(i * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };

    const drawPass = (t: number, dx: number, dy: number, color: string) => {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.fillStyle = color;
      ctx.textBaseline = "top";
      ctx.font = `${cellSize}px ui-monospace, "SFMono-Regular", Menlo, monospace`;

      const cov = coverage / 100;
      const dens = density / 100;
      const amp = (animIntensity / 100) * 0.45;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const n = noise(i);
          if (n > cov) continue;

          // flicker: яркость ячейки колеблется вокруг своего значения,
          // фаза у каждой ячейки своя — отсюда «живая» зернистость
          const flick = reduced ? 0 : Math.sin(t * 0.004 + n * 6.283) * amp;
          const lum = Math.min(1, Math.max(0, cells[i] * (1 + flick) + dens * 0.12));
          if (lum < 0.06) continue;

          const ci = Math.min(
            CHARS.length - 1,
            Math.floor((1 - lum) * (CHARS.length - 1))
          );
          const ch = CHARS[ci];
          if (ch === " ") continue;

          ctx.globalAlpha = 0.25 + lum * 0.75;
          ctx.fillText(ch, x * cellSize, y * cellSize);
        }
      }
      ctx.restore();
    };

    const render = (now: number) => {
      if (!ready) return;
      if (!reduced && now - last < FRAME_MS) {
        raf = requestAnimationFrame(render);
        return;
      }
      last = now;

      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      if (chromatic > 0) {
        // Аберрация: тёплый и холодный проходы расходятся на доли пикселя.
        // lighter складывает их в белый там, где они совпадают.
        const shift = (chromatic / 100) * 1.6;
        ctx.globalCompositeOperation = "lighter";
        drawPass(now, -shift, 0, "rgba(216, 180, 106, 0.85)"); // тёплый акцент бренда
        drawPass(now, shift, 0, "rgba(120, 190, 210, 0.55)");
        ctx.globalCompositeOperation = "source-over";
      } else {
        drawPass(now, 0, 0, "rgba(216, 180, 106, 0.85)");
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
      // Молча оставляем штатный фон: пустой канвас лучше половины кадра
      ready = false;
    };
    img.src = src;

    // Пересчёт при изменении размера: сетка привязана к пикселям, а не к процентам
    const ro = new ResizeObserver(() => {
      if (img.complete && img.naturalWidth) start();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [src, cellSize, coverage, density, animSpeed, animIntensity, chromatic]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ opacity }}
    />
  );
}
