"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "01▓▒░#</>_";

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** задержка перед стартом, мс */
  delay?: number;
}

export function ScrambleText({ text, className, delay = 0 }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [output, setOutput] = useState(text);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const el = ref.current;
    if (!el) return;

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            window.setTimeout(() => setActive(true), delay);
            io.disconnect();
          }
        }
      },
      { rootMargin: "-10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 2);
      if (revealed >= text.length) {
        setOutput(text);
        window.clearInterval(id);
        return;
      }
      setOutput(
        text
          .split("")
          .map((ch, i) => {
            if (i < revealed || ch === " ") return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );
    }, 28);
    return () => window.clearInterval(id);
  }, [active, text]);

  return (
    <span ref={ref} aria-label={text} className={className}>
      {output}
    </span>
  );
}
