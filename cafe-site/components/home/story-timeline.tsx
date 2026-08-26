import { Award, MapPin, Star } from "lucide-react";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { ParallaxImage } from "@/components/fx/parallax-image";

const STEPS = [
  {
    year: "2023",
    title: "Свиридова, 22/2",
    text: "Открываем кафе в мкрн Победа — паста, которую выбирают по форме, и домашняя атмосфера.",
  },
  {
    year: "2025",
    title: "Зегеля, 23А",
    text: "Декабрь: новый ресторан в центре, на месте легендарного Baskin Robbins. Живая музыка, свечи, большой зал.",
  },
  {
    year: "2026",
    title: "Премия 2ГИС",
    text: "«Лучший ресторан года» по версии гостей. 1490+ оценок и средний рейтинг 4.9 на двух точках.",
  },
];

export function StoryTimeline() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 md:px-8">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative order-2 lg:order-1">
          <ParallaxImage
            src="/media/photos/photo-001.jpg"
            alt="Зал ресторана Не только макароны"
            className="aspect-[4/5] rounded-3xl"
            intensity={0.1}
          />
          <Reveal
            delay={0.3}
            className="absolute -bottom-6 -right-2 rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/30 md:-right-6"
          >
            <div className="flex items-center gap-3">
              <Award className="size-8 text-primary" />
              <div>
                <p className="font-heading text-lg leading-tight">Лучший ресторан 2026</p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  премия 2ГИС · Липецк
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            [история]
          </p>
          <SplitReveal
            text="Два зала, одна семья"
            className="mt-4 font-heading text-[clamp(2rem,4.5vw,3.5rem)] leading-tight"
          />

          <ol className="mt-12 space-y-10 border-l border-border pl-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.year} delay={i * 0.12}>
                <li className="relative">
                  <span className="absolute -left-[38px] top-1 grid size-6 place-items-center rounded-full border border-primary/40 bg-background">
                    <Star className="size-3 fill-primary text-primary" />
                  </span>
                  <p className="font-mono text-sm tracking-[0.2em] text-primary">{step.year}</p>
                  <h3 className="mt-1 font-heading text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.4}>
            <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              мкрн Победа и центр — выбирайте, что ближе
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
