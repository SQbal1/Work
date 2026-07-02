import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? brand.url;

/**
 * Allow indexing of the public marketing pages; keep the prototype app
 * workspace (localStorage demo, no real content) out of search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/customers",
        "/products",
        "/invoices",
        "/settings",
        "/onboarding",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
