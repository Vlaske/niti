import type { MetadataRoute } from "next";
import { getShopRouteSlugs } from "@/config/store-categories";
import { getProductHandles } from "@/lib/catalog";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://niti.home";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [handles] = await Promise.all([getProductHandles()]);
  const shopSlugs = getShopRouteSlugs();
  const now = new Date();

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...shopSlugs.map((slug) => ({
      url: `${siteUrl}/shop/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...handles.map((handle) => ({
      url: `${siteUrl}/product/${handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    {
      url: `${siteUrl}/dostava`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/povrati`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/nega`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privatnost`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
    {
      url: `${siteUrl}/uslovi`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
  ];
}
