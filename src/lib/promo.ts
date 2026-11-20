import { cache } from "react";
import { promoConfig } from "@/config/promo";
import { getAllProducts } from "@/lib/catalog";
import { toListingProduct } from "@/lib/catalog/listing";
import { compareAtForPercent, compareDiscounts, getDiscount } from "@/lib/pricing";
import { getPromoEndsOn, isPromoActive } from "@/lib/promo-state";
import { fetchShopifyCollectionProducts } from "@/lib/shopify/catalog";
import { shopifyServerConfigured } from "@/lib/shopify/config";
import type { Product } from "@/types";

function isDiscounted(product: Product) {
  return (
    product.availableForSale !== false &&
    Boolean(product.image?.trim()) &&
    getDiscount(product.price, product.compareAtPrice) !== null
  );
}

function byDeal(a: Product, b: Product) {
  const left = getDiscount(a.price, a.compareAtPrice);
  const right = getDiscount(b.price, b.compareAtPrice);
  if (!left || !right) return 0;
  return compareDiscounts(left, right);
}

const PREVIEW_PERCENTS = [22, 15, 18, 10, 27, 12, 19, 8];

function pickPreviewProducts(all: Product[]) {
  const eligible = all.filter(
    (product) =>
      product.availableForSale !== false &&
      Boolean(product.image?.trim()) &&
      product.price > 0
  );
  const byCategory = new Map<string, Product[]>();
  for (const product of eligible) {
    const list = byCategory.get(product.category) ?? [];
    list.push(product);
    byCategory.set(product.category, list);
  }
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.handle.localeCompare(b.handle));
  }

  const categories = [...byCategory.keys()].sort();
  const picked: Product[] = [];
  let round = 0;
  while (picked.length < promoConfig.maxProducts) {
    let added = false;
    for (const category of categories) {
      const product = byCategory.get(category)?.[round];
      if (!product) continue;
      picked.push(product);
      added = true;
      if (picked.length >= promoConfig.maxProducts) break;
    }
    if (!added) break;
    round += 1;
  }
  return picked;
}

function stampPreview(product: Product, percent: number): Product {
  return {
    ...product,
    compareAtPrice: compareAtForPercent(product.price, percent),
    isSale: true,
    variants: product.variants?.map((variant) => ({
      ...variant,
      compareAtPrice: compareAtForPercent(variant.price, percent),
    })),
  };
}

/**
 * Resolve every in-stock discounted product (steepest cut first).
 * Used by the shop sale view and to decide whether the menu link shows.
 */
async function resolveSaleProducts(): Promise<{
  products: Product[];
  /** Collection existed with items but none had compare-at — do not fall back. */
  blocked: boolean;
}> {
  let picked: Product[] = [];
  let collectionHasProducts = false;

  if (shopifyServerConfigured && promoConfig.collectionHandle) {
    try {
      const fromCollection = await fetchShopifyCollectionProducts(
        promoConfig.collectionHandle,
        100
      );
      collectionHasProducts = fromCollection.length > 0;
      picked = fromCollection.filter(isDiscounted);
    } catch (error) {
      console.error("[promo] collection fetch failed:", error);
    }
  }

  const blockFallback = promoConfig.collectionOnly || collectionHasProducts;
  if (picked.length === 0 && !blockFallback) {
    const all = await getAllProducts();
    const pinned = new Set(promoConfig.handles);
    const pool =
      pinned.size > 0 ? all.filter((product) => pinned.has(product.handle)) : all;
    picked = pool.filter(isDiscounted);
  }

  return {
    products: [...picked].sort(byDeal).map(toListingProduct),
    blocked: blockFallback && picked.length === 0,
  };
}

function buildPreviewProducts(all: Product[]) {
  return pickPreviewProducts(all)
    .map((product, index) =>
      stampPreview(product, PREVIEW_PERCENTS[index % PREVIEW_PERCENTS.length])
    )
    .sort(byDeal)
    .map(toListingProduct);
}

export type PromoEdit = {
  /** Master switch: homepage band + percent badges. */
  active: boolean;
  endsOn: string | null;
  /** Homepage carousel (capped). */
  products: Product[];
  /** All discounted products for /shop?snizeno=1 (or preview set). */
  allProducts: Product[];
  /** Local sample prices only. Production never sets this. */
  preview: boolean;
  /**
   * True when buyers should see “Sniženo” in the menu / footer.
   * Real discounts, or local preview samples while the edit is on.
   */
  hasSale: boolean;
};

/**
 * Deduped per request. Layout uses hasSale; homepage uses products;
 * shop sale view uses allProducts.
 */
export const getPromoEdit = cache(async (): Promise<PromoEdit> => {
  const active = isPromoActive();
  const endsOn = active ? getPromoEndsOn() : null;
  const { products: real, blocked } = await resolveSaleProducts();

  if (
    real.length === 0 &&
    !blocked &&
    promoConfig.previewWhenEmpty &&
    process.env.NODE_ENV !== "production" &&
    active
  ) {
    const all = await getAllProducts();
    const previewProducts = buildPreviewProducts(all);
    return {
      active: true,
      endsOn,
      products: previewProducts.slice(0, promoConfig.maxProducts),
      allProducts: previewProducts,
      preview: previewProducts.length > 0,
      hasSale: previewProducts.length > 0,
    };
  }

  return {
    active,
    endsOn,
    products: active ? real.slice(0, promoConfig.maxProducts) : [],
    allProducts: real,
    preview: false,
    hasSale: real.length > 0,
  };
});
