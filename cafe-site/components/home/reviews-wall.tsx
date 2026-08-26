import { Star } from "lucide-react";

interface Quote {
  author: string;
  text: string;
}

const ROW_A: Quote[] = [
  { author: "Михаил", text: "Паста с камчатским крабом — в Липецке вкуснее я не ел" },
  { author: "Тимофей", text: "Возвращает надежду на липецкий ресторанный бизнес" },
  { author: "Диана", text: "Буду возвращаться за этой пиццей постоянно" },
  { author: "Екатерина", text: "Стейк сделали той прожарки, что просила — нежнейший" },
  { author: "Инкогнито", text: "Один из лучших ресторанов Липецка" },
  { author: "Виктория", text: "Вечер скрасили свечи и приглушённый свет" },
];

const ROW_B: Quote[] = [
  { author: "Анна", text: "Коктейльная карта — визитная карточка заведения" },
  { author: "Надежда", text: "Паста восхитительная, много начинки — прекрасна" },
  { author: "Алекс", text: "Готовят просто нереально вкусно, рекомендую всем" },
  { author: "Ирина", text: "В том яме действительно много морепродуктов" },
  { author: "Ангелина", text: "Тар-тар и карпаччо — в городе никто так не делает" },
  { author: "Евгения", text: "Нежнейшие сырники с маскарпоне, светло и просторно" },
];

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <figure className="mx-3 w-80 shrink-0 rounded-2xl border border-border bg-card p-6">
      <div className="flex gap-0.5" aria-label="5 из 5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-3.5 fill-primary text-primary" />
        ))}
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
        «{quote.text}»
      </blockquote>
      <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {quote.author} · яндекс карты
      </figcaption>
    </figure>
  );
}

export function ReviewsWall() {
  return (
    <section className="overflow-hidden border-y border-border py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          [гости говорят]
        </p>
        <h2 className="mt-3 font-heading text-[clamp(2rem,4.5vw,3.5rem)]">
          4.9 из 5 — и это не предел
        </h2>
      </div>

      <div className="marquee-paused mt-12 overflow-hidden" aria-hidden>
        <div className="animate-marquee flex w-max [--marquee-duration:55s]">
          {[0, 1].map((half) => (
            <div key={`a-${half}`} className="flex shrink-0">
              {ROW_A.map((q) => (
                <QuoteCard key={`a-${half}-${q.author}-${q.text.slice(0, 8)}`} quote={q} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="marquee-paused mt-5 overflow-hidden" aria-hidden>
        <div
          className="animate-marquee flex w-max [--marquee-duration:65s]"
          style={{ animationDirection: "reverse" }}
        >
          {[0, 1].map((half) => (
            <div key={`b-${half}`} className="flex shrink-0">
              {ROW_B.map((q) => (
                <QuoteCard key={`b-${half}-${q.author}-${q.text.slice(0, 8)}`} quote={q} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
