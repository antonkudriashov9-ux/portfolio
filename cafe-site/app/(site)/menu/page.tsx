import type { Metadata } from "next";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Меню",
};

const TAG_LABEL: Record<string, string> = {
  HIT: "хит",
  VEG: "вег",
  SPICY: "острое",
};

export default async function MenuPage() {
  const [categories, hitOfWeek] = await Promise.all([
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { dishes: { where: { available: true }, orderBy: { sortOrder: "asc" } } },
    }),
    db.dish.findFirst({ where: { isHitOfWeek: true, available: true } }),
  ]);

  return (
    <div className="theme-paper min-h-svh">
      {/* Шапка страницы */}
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-36 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          [меню] · обновляется из CRM
        </p>
        <SplitReveal
          as="h1"
          text="Меню"
          className="mt-4 font-heading text-[clamp(3rem,8vw,6rem)]"
        />
        {hitOfWeek ? (
          <Reveal delay={0.2}>
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <Star className="size-6 shrink-0 fill-primary text-primary" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  хит недели
                </p>
                <p className="mt-0.5 font-heading text-xl">
                  {hitOfWeek.title} — {hitOfWeek.price} ₽
                </p>
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>

      {/* Липкая навигация по категориям */}
      <nav
        aria-label="Категории меню"
        className="sticky top-0 z-30 border-y border-border bg-background/90 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-3 md:px-8">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="shrink-0 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {c.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Секции */}
      <div className="mx-auto max-w-5xl px-4 pb-28 md:px-8">
        {categories.map((category, ci) => (
          <section key={category.id} id={category.slug} className="scroll-mt-24 pt-16">
            <Reveal>
              {category.story ? (
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                  {category.story}
                </p>
              ) : null}
              <div className="mt-2 flex items-baseline gap-4">
                <h2 className="font-heading text-[clamp(1.8rem,4vw,2.8rem)]">
                  {category.title}
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  [{String(ci + 1).padStart(2, "0")}]
                </span>
              </div>
            </Reveal>

            <ul className="mt-8">
              {category.dishes.map((dish, di) => (
                <Reveal key={dish.id} delay={Math.min(di * 0.04, 0.3)} y={14}>
                  <li className="group border-b border-border/70 py-5">
                    <div className="flex items-baseline gap-4">
                      <h3 className="font-medium leading-snug">{dish.title}</h3>
                      <span className="mx-1 flex-1 border-b border-dotted border-border" aria-hidden />
                      <p className="shrink-0 font-mono text-base text-primary">{dish.price} ₽</p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {dish.weight ? (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {dish.weight}
                        </span>
                      ) : null}
                      {dish.description ? (
                        <span className="text-sm text-muted-foreground">{dish.description}</span>
                      ) : null}
                      {dish.tags
                        ? dish.tags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((t) => (
                              <Badge
                                key={t}
                                variant={t === "HIT" ? "default" : "outline"}
                                className="font-mono text-[10px] uppercase"
                              >
                                {TAG_LABEL[t] ?? t}
                              </Badge>
                            ))
                        : null}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </section>
        ))}

        <Reveal>
          <p className="mt-16 rounded-2xl border border-border bg-card p-5 text-center font-mono text-xs text-muted-foreground">
            это меню доставки · на месте блюда и цены могут отличаться · полный бар — в зале
          </p>
        </Reveal>
      </div>
    </div>
  );
}
