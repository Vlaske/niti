/**
 * Catalog ranking helpers — featured sort, new-arrivals curation.
 *
 * Shopify control: tag products with `novo-u-ponudi` (or `new-arrivals`) in Admin
 * to pin them on the homepage "Novo u ponudi" strip. Order among tagged items
 * still follows featured score.
 */
import { getGroupForCategorySlug } from "@/config/store-categories";
import type { Product } from "@/types";

const NEW_ARRIVALS_TAGS = new Set([
  "novo-u-ponudi",
  "novo u ponudi",
  "new-arrivals",
  "new-arrival",
  "showcase:novo",
  "showcase:new-arrivals",
]);

/** Explicit homepage showcase pick — set via Shopify product tags. */
export function isNewArrivalsFeatured(p: Product): boolean {
  return (
    p.tags?.some((t) => NEW_ARRIVALS_TAGS.has(t.toLowerCase().trim())) ??
    false
  );
}

/** Prefer products that look complete / shoppable over raw newest SKUs. */
export function productFeatureScore(p: Product): number {
  let score = 0;
  if (p.isNew) score += 12;
  if (isNewArrivalsFeatured(p)) score += 20;
  if (p.isSale) score += 4;
  if (p.availableForSale !== false) score += 6;
  if (p.images && p.images.length >= 2) score += 8;
  if (p.images && p.images.length >= 4) score += 4;
  if (p.options?.some((o) => o.type === "color" && o.values.length > 1)) {
    score += 6;
  }
  if (p.options?.some((o) => o.type === "size" && o.values.length > 1)) {
    score += 4;
  }
  // Mid-range textile prices tend to be core assortment
  if (p.price >= 1500 && p.price <= 18000) score += 5;
  if (p.price >= 3000 && p.price <= 12000) score += 3;
  // Soft penalty for placeholder / missing custom image host quality signals
  if (!p.image?.includes("cdn.shopify.com")) score -= 4;
  return score;
}

export function sortByFeatured(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const diff = productFeatureScore(b) - productFeatureScore(a);
    if (diff !== 0) return diff;
    return b.price - a.price;
  });
}

/**
 * Curated homepage strip: diverse across rooms, prefers featured SKUs.
 * Keeps payload small so New Arrivals stays fast.
 */
export function selectNewArrivalsShowcase(
  all: Product[],
  perRoom = 4,
  maxTotal = 24
): Product[] {
  const usable = all.filter(
    (p) => Boolean(p.image?.trim()) && p.availableForSale !== false
  );

  const curated = sortByFeatured(usable.filter(isNewArrivalsFeatured));
  const picked: Product[] = [];
  const seen = new Set<string>();

  for (const p of curated) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    picked.push(p);
    if (picked.length >= maxTotal) return picked;
  }

  const ranked = sortByFeatured(usable);

  const byRoom = new Map<string, Product[]>();
  for (const p of ranked) {
    if (seen.has(p.id)) continue;
    const room = getGroupForCategorySlug(p.category) ?? "all";
    const bucket = byRoom.get(room) ?? [];
    if (bucket.length < perRoom) {
      bucket.push(p);
      byRoom.set(room, bucket);
    }
  }

  for (const bucket of byRoom.values()) {
    for (const p of bucket) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      picked.push(p);
      if (picked.length >= maxTotal) return picked;
    }
  }

  for (const p of ranked) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    picked.push(p);
    if (picked.length >= maxTotal) break;
  }

  return picked;
}
