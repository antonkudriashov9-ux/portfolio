import { db } from "@/lib/db";
import { Hero } from "@/components/home/hero";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { StoryTimeline } from "@/components/home/story-timeline";
import { SignatureDishes } from "@/components/home/signature-dishes";
import { PastaWidget } from "@/components/home/pasta-widget";
import { ReviewsWall } from "@/components/home/reviews-wall";
import { LocationsTeaser } from "@/components/home/locations-teaser";
import { CtaBand } from "@/components/home/cta-band";
import { AsciiBackdrop } from "@/components/fx/ascii-backdrop";

const LOCATION_NOTES: Record<string, string> = {
  zegelya: "центр · новый ресторан · веранда",
  sviridova: "мкрн Победа · оригинал · премия 2ГИС",
};

const LOCATION_PHOTOS: Record<string, string> = {
  zegelya: "/media/photos/photo-002.jpg",
  sviridova: "/media/photos/photo-003.jpg",
};

export default async function HomePage() {
  const [settings, slides, locations, hits, hitOfWeek] = await Promise.all([
    db.settings.findUnique({ where: { id: "global" } }),
    db.heroSlide.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.location.findMany({ orderBy: { sortOrder: "asc" } }),
    db.dish.findMany({
      where: { available: true, tags: { contains: "HIT" } },
      orderBy: { sortOrder: "asc" },
      take: 5,
    }),
    db.dish.findFirst({ where: { isHitOfWeek: true, available: true } }),
  ]);

  const signature = [
    ...(hitOfWeek ? [hitOfWeek] : []),
    ...hits.filter((d) => d.id !== hitOfWeek?.id),
  ]
    .slice(0, 5)
    .map((d) => ({
      title: d.title,
      description: d.description,
      price: d.price,
      isHitOfWeek: d.isHitOfWeek,
    }));

  return (
    <>
      <Hero slides={slides} videoUrl={settings?.heroVideoUrl ?? null} />

      {/* Ниже первого экрана фон был ровным тёмным. Здесь за секциями живёт
          фотография зала, разложенная в ASCII-дизеринг: тёмная, читаемая, но
          не пустая. Слой закреплён (fixed) — секции проплывают над ним,
          создавая параллакс без дополнительного кода. */}
      <div className="relative isolate">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          {/* Фотография выбрана замером, а не на глаз: эффекту нужен контраст.
              Первая попытка (photo-014, панорама зала) дала кашу — она 77-я из
              115 по разбросу яркости. Здесь разброс 72.7 при 29% тёмного и 22%
              светлого, поэтому сюжет читается символами. */}
          <AsciiBackdrop
            src="/media/photos/photo-017.jpg"
            cellSize={9}
            coverage={100}
            density={24}
            animSpeed={80}
            animIntensity={30}
            chromatic={15}
            opacity={0.4}
            className="size-full"
          />
          {/* Вуаль поверх эффекта: без неё символы конкурируют с текстом.
              Читаемость важнее зрелищности. */}
          <div className="absolute inset-0 bg-background/72" />
        </div>

        <MarqueeStrip />
        <StoryTimeline />
        <SignatureDishes dishes={signature} photo="/media/photos/photo-005.jpg" />
        <PastaWidget />
        <ReviewsWall />
      </div>

      <LocationsTeaser
        locations={locations.map((l) => ({
          slug: l.slug,
          name: l.name,
          address: l.address,
          phone: l.phone,
          hours: l.hours,
          yandexRating: l.yandexRating,
          yandexCount: l.yandexCount,
          photo: LOCATION_PHOTOS[l.slug] ?? "/media/photos/photo-002.jpg",
          note: LOCATION_NOTES[l.slug] ?? "",
        }))}
      />
      <CtaBand />
    </>
  );
}
