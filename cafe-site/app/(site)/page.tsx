import { db } from "@/lib/db";
import { Hero } from "@/components/home/hero";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { StoryTimeline } from "@/components/home/story-timeline";
import { SignatureDishes } from "@/components/home/signature-dishes";
import { PastaWidget } from "@/components/home/pasta-widget";
import { ReviewsWall } from "@/components/home/reviews-wall";
import { LocationsTeaser } from "@/components/home/locations-teaser";
import { CtaBand } from "@/components/home/cta-band";
import { AsciiBackdropZone } from "@/components/fx/ascii-backdrop-zone";

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

      {/* Фон за секциями НИЖЕ первого экрана: там был ровный тёмный цвет.
          Обёртка сама включает мерцание только после того, как первый экран
          пройден — на нём хватает слайдера и своих анимаций.

          Фотография выбрана замером по 115 файлам: панорама зала (photo-014)
          давала нечитаемую кашу, она 77-я по разбросу яркости. У photo-017
          разброс 72.7 при 29% тёмного и 22% светлого — сюжет читается. */}
      <AsciiBackdropZone
        src="/media/photos/photo-017.jpg"
        cellSize={14}
        animIntensity={26}
        fps={12}
        opacity={0.4}
      >
        <MarqueeStrip />
        <StoryTimeline />
        <SignatureDishes dishes={signature} photo="/media/photos/photo-005.jpg" />
        <PastaWidget />
        <ReviewsWall />
      </AsciiBackdropZone>

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
