"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "active" | "label";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");
  const [label, setLabel] = useState("");

  useEffect(() => {
    const mqHover = window.matchMedia("(hover: hover)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () =>
      setEnabled(mqHover.matches && !mqReduced.matches && window.innerWidth >= 768);
    check();
    mqHover.addEventListener("change", check);
    mqReduced.addEventListener("change", check);
    return () => {
      mqHover.removeEventListener("change", check);
      mqReduced.removeEventListener("change", check);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const mouse = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }
    };

    const loop = () => {
      ring.x += (mouse.x - ring.x) * 0.16;
      ring.y += (mouse.y - ring.y) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const labelled = t.closest<HTMLElement>("[data-cursor-label]");
      if (labelled?.dataset.cursorLabel) {
        setLabel(labelled.dataset.cursorLabel);
        setVariant("label");
        return;
      }
      if (
        t.closest('a, button, input, textarea, select, [role="button"], iframe')
      ) {
        setVariant("active");
        return;
      }
      setVariant("default");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Точка */}
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[95]">
        <div
          className={cn(
            "size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-opacity duration-150",
            variant === "label" && "opacity-0"
          )}
        />
      </div>

      {/* Кольцо / подпись */}
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[94]">
        <div
          className={cn(
            "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap transition-all duration-200",
            variant === "default" &&
              "size-9 rounded-full border border-primary/40",
            variant === "active" &&
              "size-14 rounded-full border border-primary/80",
            variant === "label" &&
              "min-w-20 rounded-lg bg-primary px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground"
          )}
        >
          {variant === "label" ? label : null}
        </div>
      </div>
    </>
  );
}
