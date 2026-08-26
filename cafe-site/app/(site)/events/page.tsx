import type { Metadata } from "next";
import { CalendarHeart, Heart, Users, Wine } from "lucide-react";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { ParallaxImage } from "@/components/fx/parallax-image";
import { EventForm } from "@/components/events/event-form";

export const metadata: Metadata = {
  title: "Банкеты и события",
};

const FORMATS = [
  {
    icon: Heart,
    title: "Свадьбы",
    text: "Банкет под ключ: сервировка, декор, тайминг подачи, живая музыка. Провели свадьбу на 35 гостей — скрипач в отдельном зале.",
  },
  {
    icon: CalendarHeart,
    title: "Дни рождения",
    text: "Десерт со свечой — за наш счёт. Составим меню под компанию, заброним камерный зал.",
  },
  {
    icon: Wine,
    title: "Дегустации и корпоративы",
    text: "Коктейльные сеты, винные вечера, большой экран и отдельный зал под вашу команду.",
  },
];

export default function EventsPage() {
  return (
    <div className="pb-28">
      <div className="mx-auto max-w-7xl px-4 pt-36 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          [события]
        </p>
        <SplitReveal
          as="h1"
          text="Ваш праздник — наш зал"
          className="mt-4 max-w-3xl font-heading text-[clamp(2.6rem,7vw,5.5rem)] leading-tight"
        />
        <p className="mt-6 max-w-xl text-muted-foreground">
          Свадьба на 35 человек, день рождения с десертом со свечой или корпоративный ужин —
          организуем под ключ: меню, сервировка, тайминг, музыка.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-7xl gap-6 px-4 md:grid-cols-3 md:px-8">
        {FORMATS.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.1}>
            <div className="h-full rounded-3xl border bg-card p-7">
              <f.icon className="size-8 text-primary" />
              <h2 className="mt-5 font-heading text-2xl">{f.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <h2 className="font-heading text-3xl md:text-4xl">Оставить заявку</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Расскажите о событии — перезвоним в течение дня и держим столик.
          </p>
          <div className="mt-8">
            <EventForm />
          </div>
        </div>
        <ParallaxImage
          src="/media/photos/photo-006.jpg"
          alt="Праздничная сервировка"
          className="order-1 aspect-[4/5] rounded-3xl lg:order-2"
          intensity={0.12}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      <div className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <Reveal>
          <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-7">
            <Users className="size-8 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Кейс: свадьба на 35 гостей — 15 августа 2026. Скатерти, декор, персональный тайминг
              подачи и скрипач в камерном зале. Гости отметили сервис в отзывах.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
