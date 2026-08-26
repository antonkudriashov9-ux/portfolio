import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";
import { SplitReveal } from "@/components/fx/split-reveal";

export const metadata: Metadata = {
  title: "Галерея",
};

export default async function GalleryPage() {
  const items = await db.mediaItem.findMany({
    where: { inGallery: true, kind: "photo" },
    orderBy: { url: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-36 md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        [галерея] · {items.length} кадров
      </p>
      <SplitReveal
        as="h1"
        text="Зал, свет, детали"
        className="mt-4 font-heading text-[clamp(2.6rem,7vw,5.5rem)]"
      />
      <p className="mt-5 max-w-lg text-muted-foreground">
        Реальные кадры наших гостей и команды — без стока и постановки.
      </p>

      <div className="mt-14 columns-2 gap-4 md:columns-3 xl:columns-4 [&>*]:mb-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-border"
          >
            <Image
              src={item.url}
              alt={item.title ?? "Фото ресторана"}
              width={800}
              height={i % 3 === 0 ? 1000 : i % 3 === 1 ? 600 : 800}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
