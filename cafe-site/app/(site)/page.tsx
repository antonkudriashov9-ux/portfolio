import { db } from "@/lib/db";
import { Hero } from "@/components/home/hero";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { StoryTimeline } from "@/components/home/story-timeline";
import { SignatureDishes } from "@/components/home/signature-dishes";
import { PastaWidget } from "@/components/home/pasta-widget";
import { ReviewsWall } from "@/components/home/reviews-wall";
import { LocationsTeaser } from "@/components/home/locations-teaser";
import { CtaBand } from "@/components/home/cta-band";
import { GenerativeBackdrop } from "@/components/fx/generative-backdrop";

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

      {/* Генеративный фон ТОЛЬКО за секциями ниже первого экрана.

          Слой sticky, а не fixed. Это принципиально: fixed привязан к окну и
          существует всегда, поэтому проступал за первым экраном в моменты
          перекрёстного затухания слайдов — там вуали полупрозрачны.
          Sticky привязан к этой обёртке и физически не может оказаться выше
          её начала, то есть на первом экране его нет вообще.

          -mb-[100svh] возвращает занятое место: слой высотой в экран не должен
          сдвигать секции вниз. */}
      <div className="relative isolate">
        <div className="pointer-events-none sticky top-0 -z-10 h-svh -mb-[100svh] overflow-hidden">
          {/* dotAlpha 0.045, а не 0.055: при 0.055 накопленный след давал
              контраст приглушённого текста 4.40 при пороге WCAG 4.5.
              Расчётом подобрано значение, где контраст 4.83, а след виден. */}
          <GenerativeBackdrop
            maxDots={420}
            fps={20}
            noise={0.012}
            dotAlpha={0.045}
            opacity={0.85}
            className="size-full"
          />
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
