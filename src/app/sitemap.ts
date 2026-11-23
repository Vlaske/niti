import type { MetadataRoute } from "next";
import { getShopRouteSlugs } from "@/config/store-categories";
import { getProductHandles } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/seo";
import { shopifyServerConfigured } from "@/lib/shopify/config";
import { fetchShopifyProductHandleRows } from "@/lib/shopify/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const shopSlugs = getShopRouteSlugs();
  const now = new Date();

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    if (shopifyServerConfigured) {
      const rows = await fetchShopifyProductHandleRows();
      productEntries = rows.map((row) => ({
        url: `${siteUrl}/product/${row.handle}`,
        lastModified: row.updatedAt ? new Date(row.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    } else {
      const handles = await getProductHandles();
      productEntries = handles.map((handle) => ({
        url: `${siteUrl}/product/${handle}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    productEntries = [];
  }

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/shop?snizeno=1`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...shopSlugs.map((slug) => ({
      url: `${siteUrl}/shop/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...productEntries,
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
