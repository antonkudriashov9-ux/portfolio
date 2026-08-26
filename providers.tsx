"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

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
      window.__lenis.scrollTo(el, { offset: -64 });
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

function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({ lerp: 0.1 });
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

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200}>
        <SmoothScroll />
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}
