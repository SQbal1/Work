import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? brand.url;

/** Public marketing routes only. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/features", priority: 0.8 },
    { path: "/pricing", priority: 0.8 },
    { path: "/demo", priority: 0.7 },
    { path: "/contact", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/compliance", priority: 0.4 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
