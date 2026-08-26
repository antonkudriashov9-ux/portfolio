"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const LOG_LINES = [
  "> инициализация ядра",
  "> загрузка модулей … ok",
  "> компоновка интерфейса … ok",
];

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem("preloaded")) return;

    let intervalId = 0;
    const startId = window.setTimeout(() => {
      setVisible(true);
      document.documentElement.style.overflow = "hidden";

      intervalId = window.setInterval(() => {
        setProgress((p) => {
          const next = Math.min(100, p + Math.floor(Math.random() * 12) + 6);
          if (next >= 100) {
            window.clearInterval(intervalId);
            window.setTimeout(() => {
              sessionStorage.setItem("preloaded", "1");
              setVisible(false);
              document.documentElement.style.overflow = "";
            }, 400);
          }
          return next;
        });
      }, 110);
    }, 0);

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Загрузка сайта"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-background"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="w-full max-w-xs space-y-1 font-mono text-[11px] text-muted-foreground">
            {LOG_LINES.map((line, i) => (
              <p
                key={line}
                className={
                  progress > (i + 1) * 22 ? "text-muted-foreground" : "opacity-0"
                }
              >
                {line}
              </p>
            ))}
          </div>

          <p className="font-heading text-6xl font-bold tabular-nums md:text-7xl">
            {String(progress).padStart(2, "0")}
            <span className="text-primary">%</span>
          </p>

          <div className="h-px w-56 overflow-hidden bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
