"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  /** сила смещения в долях высоты контейнера (0.05–0.25) */
  intensity?: number;
  priority?: boolean;
  sizes?: string;
}

/** Изображение, плывущее внутри обрезанного контейнера при скролле. */
export function ParallaxImage({
  src,
  alt,
  className,
  intensity = 0.12,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: ParallaxImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: -intensity * 100 },
        {
          yPercent: intensity * 100,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, wrap);

    return () => ctx.revert();
  }, [intensity]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className ?? ""}`}>
      <div ref={innerRef} className="absolute -inset-y-[15%] inset-x-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    </div>
  );
}
