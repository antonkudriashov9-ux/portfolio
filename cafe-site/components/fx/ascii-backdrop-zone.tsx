"use client";

/**
 * Обёртка для ASCII-фона: включает анимацию только после первого экрана.
 *
 * Зачем отдельный компонент: слой фона закреплён (`position: fixed`), поэтому
 * он «виден» всегда и IntersectionObserver внутри самого фона никогда его не
 * выключал. Анимация шла и на первом экране — там, где уже работают слайдер,
 * зум фотографии и девять motion-элементов. Из-за этого страница лагала именно
 * в начале, где впечатление важнее всего.
 *
 * Здесь наблюдение идёт за ЯКОРЕМ в начале контентной зоны, а не за самим
 * фоном: пока якорь на экране (то есть виден первый экран), анимация выключена
 * и фон стоит статичной текстурой.
 *
 * IntersectionObserver, а не обработчик прокрутки: он не вызывается на каждый
 * пиксель и не нагружает основной поток.
 */

import { useEffect, useRef, useState } from "react";
import { AsciiBackdrop } from "./ascii-backdrop";

type Props = {
  src: string;
  cellSize?: number;
  animIntensity?: number;
  fps?: number;
  opacity?: number;
  children: React.ReactNode;
};

export function AsciiBackdropZone({
  src,
  cellSize = 14,
  animIntensity = 26,
  fps = 12,
  opacity = 0.4,
  children,
}: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        // Якорь ушёл вверх за экран — значит первый экран пройден
        setAnimate(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative isolate">
      {/* Якорь высотой в экран: пока он в кадре, мы на первом экране */}
      <div ref={anchorRef} className="pointer-events-none absolute -top-svh h-svh w-px" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <AsciiBackdrop
          src={src}
          cellSize={cellSize}
          animIntensity={animIntensity}
          fps={fps}
          opacity={opacity}
          active={animate}
          className="size-full"
        />
        {/* Вуаль: без неё символы конкурируют с текстом. Читаемость важнее. */}
        <div className="absolute inset-0 bg-background/72" />
      </div>

      {children}
    </div>
  );
}
