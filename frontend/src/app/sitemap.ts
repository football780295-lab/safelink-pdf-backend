import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/compress",
    "/merge",
    "/split",
    "/jpg-to-pdf",
    "/pdf-to-jpg",
    "/protect",
    "/unlock",
    "/privacy",
    "/terms",
    "/about",
    "/contact",
  ];

  const languages = ["en", "bn"];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const lang of languages) {
    for (const route of routes) {
      sitemapEntries.push({
        url: `${SITE_URL}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
        alternates: {
          languages: {
            en: `${SITE_URL}/en${route}`,
            bn: `${SITE_URL}/bn${route}`,
          },
        },
      });
    }
  }

  return sitemapEntries;
}
