"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 15 });
  const sy = useSpring(y, { stiffness: 180, damping: 15 });

  useEffect(() => {
    enabledRef.current =
      window.matchMedia("(hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        if (!enabledRef.current || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * strength);
        y.set((e.clientY - rect.top - rect.height / 2) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
