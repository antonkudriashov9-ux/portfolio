"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitReveal } from "@/components/fx/split-reveal";
import { Counter } from "@/components/fx/counter";
import { Magnetic } from "@/components/fx/magnetic";

interface HeroProps {
  slides: { id: string; mediaUrl: string }[];
  videoUrl: string | null;
}

export function Hero({ slides, videoUrl }: HeroProps) {
  const [active, setActive] = useState(0);
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (!hasSlides || videoUrl) return;
    const id = window.setInterval(() => setActive((v) => (v + 1) % slides.length), 6000);
    return () => window.clearInterval(id);
  }, [hasSlides, slides.length, videoUrl]);

  return (
    <section className="relative flex min-h-svh items-end overflow-hidden">
      {/* Фон: видео или параллакс-слайдер */}
      {videoUrl ? (
        <video
          className="absolute inset-0 size-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <div className="absolute inset-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={slides[active]?.id ?? "empty"}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              {hasSlides ? (
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.08 }}
                  transition={{ duration: 7, ease: "linear" }}
                >
                  <Image
                    src={slides[active].mediaUrl}
                    alt="Интерьер ресторана Не только макароны"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <div className="absolute inset-0 bg-card" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Вуали для читаемости */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

      {/* Контент */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-40 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          lipetsk · {new Date().getFullYear() < 2027 ? "non solo pasta" : "non solo pasta"} · с 08:00
        </motion.p>

        <SplitReveal
          as="h1"
          text="Не только макароны"
          delay={0.35}
          stagger={0.09}
          className="mt-5 max-w-4xl font-heading text-[clamp(2.8rem,9vw,7.5rem)] leading-[1.02] text-foreground"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-6 max-w-xl text-base text-foreground/80 md:text-lg"
        >
          Авторская паста с выбором формы, пицца из печи и стейки.
          Завтракаем с восьми утра, ужинаем при свечах.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <Button asChild size="lg" className="text-base">
              <Link href="/booking">
                Забронировать столик
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild size="lg" variant="outline" className="bg-background/40 backdrop-blur-sm">
              <Link href="/menu">Меню</Link>
            </Button>
          </Magnetic>
        </motion.div>

        {/* Статы */}
        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-border/60 pt-6"
        >
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              рейтинг
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 font-heading text-3xl">
              <Counter to={4.9} decimals={1} />
              <Star className="size-5 fill-primary text-primary" />
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              оценок гостей
            </dt>
            <dd className="mt-1 font-heading text-3xl">
              <Counter to={1490} suffix="+" />
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              зала в городе
            </dt>
            <dd className="mt-1 font-heading text-3xl">
              <Counter to={2} />
            </dd>
          </div>
        </motion.dl>
      </div>

      {/* Скролл-подсказка */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 right-6 z-10 hidden flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:flex"
        aria-hidden
      >
        scroll
        <ArrowDown className="size-4 animate-bounce" />
      </motion.div>
    </section>
  );
}
