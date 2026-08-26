import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { ParallaxImage } from "@/components/fx/parallax-image";

interface LocationCard {
  slug: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  yandexRating: number | null;
  yandexCount: number | null;
  photo: string;
  note: string;
}

export function LocationsTeaser({ locations }: { locations: LocationCard[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        [адреса]
      </p>
      <SplitReveal
        text="Выбирайте, что ближе"
        className="mt-3 font-heading text-[clamp(2rem,4.5vw,3.5rem)]"
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {locations.map((loc, i) => (
          <Reveal key={loc.slug} delay={i * 0.1}>
            <article className="group overflow-hidden rounded-3xl border bg-card transition-colors hover:border-primary/40">
              <div className="relative">
                <ParallaxImage
                  src={loc.photo}
                  alt={`Ресторан на ${loc.name}`}
                  className="aspect-[16/10]"
                  intensity={0.1}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {loc.yandexRating ? (
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 py-1.5 font-mono text-xs backdrop-blur">
                    <Star className="size-3.5 fill-primary text-primary" />
                    {loc.yandexRating.toFixed(1)}
                    {loc.yandexCount ? (
                      <span className="text-muted-foreground">· {loc.yandexCount}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="p-7">
                <h3 className="font-heading text-2xl">{loc.name}</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {loc.note}
                </p>
                <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    {loc.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-primary" />
                    {loc.phone}
                  </p>
                  <p className="font-mono text-xs">{loc.hours}</p>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/booking?location=${loc.slug}`}>Забронировать</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/locations#${loc.slug}`}>
                      Подробнее
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
