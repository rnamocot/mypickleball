import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"],
    ["/features", 0.9, "monthly"],
    ["/pricing", 0.9, "monthly"],
    ["/about", 0.7, "monthly"],
    ["/contact", 0.7, "yearly"],
    ["/signup", 0.6, "yearly"],
    ["/privacy", 0.3, "yearly"],
    ["/terms", 0.3, "yearly"],
  ];
  return pages.map(([path, priority, changeFrequency]) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
