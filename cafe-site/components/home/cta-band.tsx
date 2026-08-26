import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { Magnetic } from "@/components/fx/magnetic";
import { site } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-blueprint opacity-70" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-28 text-center md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          [столик ждёт]
        </p>
        <SplitReveal
          text="Приходите — остальное сделаем мы"
          className="mx-auto mt-4 max-w-3xl font-heading text-[clamp(2.2rem,5.5vw,4.5rem)] leading-tight"
        />
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Button asChild size="lg" className="text-base">
                <Link href="/booking">
                  Забронировать онлайн
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild size="lg" variant="outline">
                <a href={site.phoneMainHref}>Или позвонить</a>
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
