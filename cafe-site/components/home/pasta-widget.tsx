"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { cn } from "@/lib/utils";

type Shape = "pappardelle" | "tagliatelle" | "spaghetti";

const SHAPES: Record<
  Shape,
  { label: string; hint: string; pairing: string }
> = {
  pappardelle: {
    label: "Паппарделле",
    hint: "широкие ленты",
    pairing: "Держит густые сливочные соусы: краб, телятина, лосось",
  },
  tagliatelle: {
    label: "Тальятелле",
    hint: "классическая лента",
    pairing: "Идеальна под болоньезе и грибы с трюфельным маслом",
  },
  spaghetti: {
    label: "Спагетти",
    hint: "тонкая классика",
    pairing: "Альо-ольо, морепродукты, томаты и базилик",
  },
};

function PastaSvg({ shape }: { shape: Shape }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
  };
  return (
    <motion.svg
      key={shape}
      viewBox="0 0 200 200"
      className="size-full text-cream"
      initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      {shape === "spaghetti" &&
        Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            {...common}
            strokeWidth={2.2}
            d={`M 20 ${45 + i * 8} C 70 ${25 + i * 9}, 130 ${70 + i * 6}, 180 ${40 + i * 8}`}
          />
        ))}
      {shape === "tagliatelle" &&
        Array.from({ length: 6 }).map((_, i) => (
          <path
            key={i}
            {...common}
            strokeWidth={7}
            d={`M 25 ${50 + i * 17} C 75 ${20 + i * 22}, 125 ${85 + i * 14}, 175 ${45 + i * 18}`}
          />
        ))}
      {shape === "pappardelle" &&
        Array.from({ length: 4 }).map((_, i) => (
          <path
            key={i}
            {...common}
            strokeWidth={14}
            opacity={0.85}
            d={`M 22 ${55 + i * 30} C 70 ${18 + i * 38}, 130 ${95 + i * 24}, 178 ${50 + i * 32}`}
          />
        ))}
    </motion.svg>
  );
}

export function PastaWidget() {
  const [shape, setShape] = useState<Shape>("pappardelle");

  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-28 md:grid-cols-2 md:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            [фирменная фишка]
          </p>
          <SplitReveal
            text="Выбери свою форму"
            className="mt-4 font-heading text-[clamp(2rem,4.5vw,3.5rem)] leading-tight"
          />
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-md text-muted-foreground">
              Единственное место в городе, где пасту собирают под вас:
              выбирайте форму — сварим al dente и соединим с соусом,
              который её раскрывает.
            </p>
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Форма пасты">
            {(Object.keys(SHAPES) as Shape[]).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={shape === key}
                onClick={() => setShape(key)}
                className={cn(
                  "rounded-full border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] transition-all",
                  shape === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {SHAPES[key].label}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={shape}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-heading text-xl">{SHAPES[shape].hint}</p>
                <p className="mt-1 text-sm text-muted-foreground">{SHAPES[shape].pairing}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-border bg-[#0d0b08]">
            <div className="absolute inset-0 bg-blueprint opacity-60" aria-hidden />
            <div className="absolute inset-6">
              <PastaSvg shape={shape} />
            </div>
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              al dente · всегда
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
