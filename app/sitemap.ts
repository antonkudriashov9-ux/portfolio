import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { projects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "monthly", priority: 1 },
    ...projects.flatMap((p) => [
      { url: `${base}/projects/${p.slug}`, lastModified, changeFrequency: "yearly" as const, priority: 0.8 },
      { url: `${base}/projects/${p.slug}/demo`, lastModified, changeFrequency: "yearly" as const, priority: 0.6 },
    ]),
  ];
}
