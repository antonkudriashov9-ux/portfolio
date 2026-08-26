import { PrismaClient } from "@prisma/client";
import { readdirSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const dir = path.join(process.cwd(), "public", "media", "photos");
  const files = readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
  console.log(`found ${files.length} photos`);

  await prisma.mediaItem.deleteMany({});

  let order = 0;
  for (const file of files) {
    await prisma.mediaItem.create({
      data: {
        url: `/media/photos/${file}`,
        kind: "photo",
        title: file.replace(".jpg", ""),
        inGallery: true,
      },
    });
    order++;
  }

  // hero slides: первые 5 фото (в галерее Яндекса первыми идут снимки владельца)
  await prisma.heroSlide.deleteMany({});
  const heroPicks = files.slice(0, 5);
  let hs = 0;
  for (const file of heroPicks) {
    await prisma.heroSlide.create({
      data: {
        mediaUrl: `/media/photos/${file}`,
        title: "Не только макароны",
        active: true,
        sortOrder: hs++,
      },
    });
  }

  console.log(`media: ${order} photos, ${heroPicks.length} hero slides`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
