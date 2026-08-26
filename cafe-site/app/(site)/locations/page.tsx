import type { Metadata } from "next";
import Link from "next/link";
import { Award, Clock, MapPin, Phone, Star } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/fx/reveal";
import { SplitReveal } from "@/components/fx/split-reveal";
import { ParallaxImage } from "@/components/fx/parallax-image";

export const metadata: Metadata = {
  title: "Адреса",
};

const MAPS: Record<string, { ll: string; pt: string }> = {
  zegelya: { ll: "39.597343%2C52.614207", pt: "39.597343,52.614207" },
  sviridova: { ll: "39.519129%2C52.576138", pt: "39.519129,52.576138" },
};

const PHOTOS: Record<string, string> = {
  zegelya: "/media/photos/photo-002.jpg",
  sviridova: "/media/photos/photo-003.jpg",
};

const NOTES: Record<string, string[]> = {
  zegelya: [
    "Центр города, дом на месте легендарного Baskin Robbins",
    "Большой зал + 2 камерных зала, летняя веранда",
    "Идеально для вечера, коктейлей и праздников",
  ],
  sviridova: [
    "Оригинальная точка — открылась первой, в 2023 году",
    "Премия 2ГИС «Лучший ресторан 2026»",
    "Семейные завтраки и ужины, детский уголок",
  ],
};

export default async function LocationsPage() {
  const locations = await db.location.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-36 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        [адреса]
      </p>
      <SplitReveal
        as="h1"
        text="Два зала в Липецке"
        className="mt-4 font-heading text-[clamp(2.6rem,7vw,5.5rem)]"
      />

      <div className="mt-16 space-y-24">
        {locations.map((loc, i) => {
          const map = MAPS[loc.slug];
          const flip = i % 2 === 1;
          return (
            <section key={loc.id} id={loc.slug} className="scroll-mt-24">
              <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
                <ParallaxImage
                  src={PHOTOS[loc.slug] ?? "/media/photos/photo-002.jpg"}
                  alt={`Ресторан на ${loc.name}`}
                  className={`aspect-[4/3] rounded-3xl ${flip ? "lg:order-2" : ""}`}
                  intensity={0.1}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                <div className={flip ? "lg:order-1" : ""}>
                  <Reveal>
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-3xl md:text-4xl">{loc.name}</h2>
                      {loc.yandexRating ? (
                        <span className="flex items-center gap-1 rounded-full border border-border px-3 py-1 font-mono text-xs">
                          <Star className="size-3.5 fill-primary text-primary" />
                          {loc.yandexRating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    {loc.slug === "sviridova" ? (
                      <p className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-olive">
                        <Award className="size-4" />
                        лучший ресторан 2026 · премия 2ГИС
                      </p>
                    ) : null}
                  </Reveal>

                  <ul className="mt-6 space-y-2.5">
                    {(NOTES[loc.slug] ?? []).map((note) => (
                      <Reveal key={note} delay={0.08}>
                        <li className="flex gap-2.5 text-sm text-muted-foreground">
                          <span className="mt-0.5 text-primary" aria-hidden>
                            ✦
                          </span>
                          {note}
                        </li>
                      </Reveal>
                    ))}
                  </ul>

                  <Reveal delay={0.15}>
                    <div className="mt-7 space-y-2 text-sm">
                      <p className="flex items-center gap-2.5">
                        <MapPin className="size-4 shrink-0 text-primary" />
                        {loc.address}
                      </p>
                      <p className="flex items-center gap-2.5">
                        <Phone className="size-4 shrink-0 text-primary" />
                        <a href={`tel:${loc.phone.replace(/[^+\d]/g, "")}`} className="hover:text-primary">
                          {loc.phone}
                        </a>
                      </p>
                      <p className="flex items-center gap-2.5">
                        <Clock className="size-4 shrink-0 text-primary" />
                        {loc.hours}
                      </p>
                    </div>
                    <Button asChild className="mt-7">
                      <Link href={`/booking?location=${loc.slug}`}>Забронировать здесь</Link>
                    </Button>
                  </Reveal>
                </div>
              </div>

              {map ? (
                <Reveal delay={0.1}>
                  <div className="mt-8 overflow-hidden rounded-3xl border border-border">
                    <iframe
                      src={`https://yandex.ru/map-widget/v1/?ll=${map.ll}&z=16&pt=${map.pt},pm2rdm`}
                      width="100%"
                      height="320"
                      frameBorder="0"
                      title={`Карта: ${loc.name}`}
                      loading="lazy"
                    />
                  </div>
                </Reveal>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
