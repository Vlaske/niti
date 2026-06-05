import {
  STORE_CATEGORIES,
  type StoreCategoryConfig,
} from "@/config/store-categories";
import { shopifyServerConfigured } from "@/lib/shopify/config";
import { fetchAllNavCollectionMeta } from "@/lib/shopify/collections";
import type { Category } from "@/types";

export const CATEGORY_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80";

function mergeCategory(
  config: StoreCategoryConfig,
  shopify?: {
    title: string;
    description: string;
    imageUrl: string | null;
    productCount: number;
  }
): Category {
  return {
    slug: config.slug,
    title: shopify?.title?.trim() || config.title,
    description: shopify?.description?.trim() || config.description,
    image: shopify?.imageUrl || config.image || CATEGORY_IMAGE_FALLBACK,
    productCount: shopify?.productCount ?? 0,
  };
}

/** Kategorije sa slikom i brojem proizvoda iz Shopify kolekcija. */
export async function getEnrichedNavCategories(): Promise<Category[]> {
  if (!shopifyServerConfigured) {
    return STORE_CATEGORIES.map((c) =>
      mergeCategory(c, undefined)
    );
  }

  try {
    const metaMap = await fetchAllNavCollectionMeta();
    return STORE_CATEGORIES.map((config) =>
      mergeCategory(config, metaMap.get(config.slug))
    );
  } catch (e) {
    console.error("[catalog] enriched categories failed:", e);
    return STORE_CATEGORIES.map((c) => mergeCategory(c, undefined));
  }
}
