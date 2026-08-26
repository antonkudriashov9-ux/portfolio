"use client";

import { SectionHeading } from "@/components/fx/section-heading";
import { Reveal } from "@/components/fx/reveal";

const JOBS = [
  {
    period: "2024 — н.в.",
    role: "Senior Full Stack Developer",
    company: "финтех-стартап",
    bullets: [
      "Спроектировал и вывел в прод микросервисный биллинг: 40k транзакций в сутки без инцидентов",
      "Сократил TTI личного кабинета с 4.8с до 1.3с (код-сплиттинг, edge-кэш, миграция на RSC)",
      "Веду ревью и менторю двух middle-разработчиков",
    ],
  },
  {
    period: "2022 — 2024",
    role: "Full Stack Developer",
    company: "digital-студия",
    bullets: [
      "Доставил 12 клиентских проектов под ключ: e-commerce, корпоративные платформы, промо",
      "Внедрил общий стек и UI-кит — время сборки типового проекта сократилось вдвое",
      "Настроил CI/CD с автотестами: деплой из часа ручной боли в один merge",
    ],
  },
  {
    period: "2020 — 2022",
    role: "Frontend Developer",
    company: "продуктовая компания",
    bullets: [
      "Разработал интерактивный конструктор документов на React",
      "Перевёл legacy-jQuery фронтенд на современный стек без остановки разработки",
    ],
  },
];

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 md:px-6">
      <SectionHeading
        index="03"
        label="опыт"
        title="Путь"
      />

      <ol className="relative ml-3 space-y-12 border-l border-border">
        {JOBS.map((job, i) => (
          <li key={job.period} className="relative pl-8">
            <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-background" />
            <Reveal delay={i * 0.08}>
              <p className="font-mono text-xs tracking-[0.16em] text-primary uppercase">
                [{job.period}]
              </p>
              <h3 className="mt-2 font-heading text-xl font-bold md:text-2xl">
                {job.role}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                @ {job.company}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {job.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="mt-0.5 text-primary" aria-hidden>
                      ▸
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
