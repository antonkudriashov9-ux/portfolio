"use client";

import { useEffect } from "react";
import Lenis from "lenis";

interface LenisStub {
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number }
  ) => void;
}

declare global {
  interface Window {
    __lenis?: LenisStub;
  }
}

export function scrollToSection(target: string | number) {
  if (typeof target === "string") {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -72 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }
  if (window.__lenis) {
    window.__lenis.scrollTo(target);
  } else {
    window.scrollTo({ top: target, behavior: "smooth" });
  }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.09 });
    window.__lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
