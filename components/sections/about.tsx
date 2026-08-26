"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/fx/section-heading";
import { Reveal } from "@/components/fx/reveal";
import { ScrambleText } from "@/components/fx/scramble-text";
import { siteConfig } from "@/lib/config";

const STACK_GROUPS = [
  { label: "frontend", items: ["React", "Next.js", "TypeScript", "Tailwind", "Motion"] },
  { label: "backend", items: ["Node.js", "NestJS", "PostgreSQL", "MongoDB", "Redis"] },
  { label: "devops", items: ["Docker", "GitHub Actions", "Nginx", "Vercel"] },
];

function LocalTimeCell() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <>
      <p className="font-heading text-4xl font-bold tabular-nums">
        {time}
      </p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        локальное время · {siteConfig.city}
      </p>
    </>
  );
}

const CELL = "rounded-2xl border bg-card p-6";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 md:px-6">
      <SectionHeading
        index="01"
        label="обо мне"
        title="Кто здесь"
        description="Разработчик, который закрывает весь цикл: придумал — спроектировал — написал — задеплоил."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Биография */}
        <Reveal className="md:col-span-2" delay={0}>
          <div className={`${CELL} h-full`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {"// биография"}
            </p>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/90">
              <p>
                Привет! Я — {siteConfig.name}, full stack разработчик из{" "}
                {siteConfig.city}. {siteConfig.experienceYears} лет превращаю идеи
                в работающие продукты: от сырого макета на салфетке до продакшна
                с мониторингом и CI/CD.
              </p>
              <p>
                Люблю типографику, честную производительность и интерфейсы,
                которые отвечают быстрее, чем пользователь успевает усомниться.
                На бэкенде ценю предсказуемость: понятные схемы данных, идемпотентные
                операции и логи, которые читаются без расшифровки.
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                ~$ echo $PHILOSOPHY → «код, который не стыдно открыть в 3 часа ночи»
              </p>
            </div>
          </div>
        </Reveal>

        {/* Время */}
        <Reveal delay={0.06}>
          <div className={`${CELL} flex h-full flex-col justify-center`}>
            <LocalTimeCell />
          </div>
        </Reveal>

        {/* Стек */}
        <Reveal delay={0.12} className="md:col-span-1">
          <div className={`${CELL} h-full`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {"// стек"}
            </p>
            <div className="mt-4 space-y-4">
              {STACK_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="font-mono text-xs text-primary">{g.label}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border px-2 py-1 font-mono text-[11px] text-secondary-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* GitHub */}
        <Reveal delay={0.18}>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            data-cursor-label="GitHub"
            className={`${CELL} block h-full transition-colors hover:border-primary/40`}
          >
            <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {"// github"}
              <ArrowUpRight className="size-4" />
            </p>
            <dl className="mt-4 space-y-2.5 font-mono text-sm">
              {[
                ["репозитории", "42"],
                ["звёзды", "380+"],
                ["коммиты за год", "1 200+"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-bold text-primary">
                    <ScrambleText text={v} />
                  </dd>
                </div>
              ))}
            </dl>
          </a>
        </Reveal>

        {/* Принцип */}
        <Reveal delay={0.24} className="md:col-span-2">
          <div className={`${CELL} flex h-full flex-col justify-center`}>
            <p className="font-heading text-xl font-bold leading-snug md:text-2xl">
              «Хороший продукт — это когда инженерное решение вообще не
              ощущается как решение. Оно просто работает.»
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              — принцип, которым проверяю каждую задачу
            </p>
          </div>
        </Reveal>

        {/* Опыт в цифре */}
        <Reveal delay={0.3}>
          <div className={`${CELL} flex h-full flex-col justify-center`}>
            <p className="font-heading text-5xl font-extrabold text-primary">
              {siteConfig.experienceYears}
              <span className="text-foreground">+</span>
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              лет коммерческой разработки
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
