/**
 * Catalog ranking helpers — featured sort, new-arrivals curation.
 *
 * Shopify Admin → product → Tags:
 * - `istaknuto:1` puts that product first on the shop's recommended order.
 *   `istaknuto:2` is second. Lower number is earlier.
 * - `istaknuto` with no number still comes before ordinary products.
 * - Products without the tag keep the automatic order.
 * - `novo-u-ponudi` or `novo u ponudi` fills the homepage "Novo u ponudi"
 *   row. `novo-u-ponudi:1` is first, `:2` is second. When any product has
 *   this tag, that row shows only the tagged products.
 */
import { getGroupForCategorySlug } from "@/config/store-categories";
import type { Product } from "@/types";

const NEW_ARRIVAL_PREFIXES = [
  "novo-u-ponudi",
  "novo u ponudi",
  "new-arrivals",
  "new-arrival",
  "showcase:novo",
  "showcase:new-arrivals",
];

const HIGHLIGHT_PREFIXES = ["istaknuto", "featured", "highlight"];

function productTags(product: Product): string[] {
  return (product.tags ?? []).map((tag) => tag.toLowerCase().trim());
}

/** Explicit index from `prefix` or `prefix:12`. No number sorts after numbered tags. */
function indexFromPrefixes(product: Product, prefixes: string[]): number | null {
  let best: number | null = null;
  for (const tag of productTags(product)) {
    for (const prefix of prefixes) {
      if (tag !== prefix && !tag.startsWith(`${prefix}:`)) continue;
      const raw = tag === prefix ? "" : tag.slice(prefix.length + 1).trim();
      const parsed = raw ? Number.parseInt(raw, 10) : Number.POSITIVE_INFINITY;
      const index = Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.POSITIVE_INFINITY;
      best = best == null ? index : Math.min(best, index);
    }
  }
  return best;
}

function compareIndexes(a: number | null, b: number | null): number {
  const aPinned = a != null;
  const bPinned = b != null;
  if (aPinned !== bPinned) return aPinned ? -1 : 1;
  if (aPinned && bPinned && a !== b) return a! - b!;
  return 0;
}

/** Shop first-page control. Tag `istaknuto` or `istaknuto:1` in Shopify. */
export function isHighlighted(product: Product): boolean {
  return indexFromPrefixes(product, HIGHLIGHT_PREFIXES) != null;
}

/** Homepage "Novo u ponudi" pick, including `novo-u-ponudi:3`. */
export function isNewArrivalsFeatured(product: Product): boolean {
  return indexFromPrefixes(product, NEW_ARRIVAL_PREFIXES) != null;
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

function byScoreThenTitle(a: Product, b: Product): number {
  const diff = productFeatureScore(b) - productFeatureScore(a);
  if (diff !== 0) return diff;
  return a.title.localeCompare(b.title, "sr");
}

/** Recommended shop order. Numbered `istaknuto` tags lead; the rest stay automatic. */
export function sortByFeatured(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const pin = compareIndexes(
      indexFromPrefixes(a, HIGHLIGHT_PREFIXES),
      indexFromPrefixes(b, HIGHLIGHT_PREFIXES)
    );
    if (pin !== 0) return pin;
    return byScoreThenTitle(a, b);
  });
}

function showcaseIndex(product: Product): number | null {
  const highlighted = indexFromPrefixes(product, HIGHLIGHT_PREFIXES);
  const arrival = indexFromPrefixes(product, NEW_ARRIVAL_PREFIXES);
  if (highlighted == null) return arrival;
  if (arrival == null) return highlighted;
  return Math.min(highlighted, arrival);
}

/** Homepage row when Shopify tags are set. Untagged products stay out. */
export function selectTaggedNewArrivals(
  all: Product[],
  maxTotal = 24
): Product[] {
  return all
    .filter(
      (product) =>
        Boolean(product.image?.trim()) &&
        product.availableForSale !== false &&
        isNewArrivalsFeatured(product)
    )
    .sort((a, b) => {
      const pin = compareIndexes(
        indexFromPrefixes(a, NEW_ARRIVAL_PREFIXES),
        indexFromPrefixes(b, NEW_ARRIVAL_PREFIXES)
      );
      if (pin !== 0) return pin;
      return byScoreThenTitle(a, b);
    })
    .slice(0, maxTotal);
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

  const curated = [...usable]
    .filter((product) => isNewArrivalsFeatured(product) || isHighlighted(product))
    .sort((a, b) => {
      const pin = compareIndexes(showcaseIndex(a), showcaseIndex(b));
      if (pin !== 0) return pin;
      return byScoreThenTitle(a, b);
    });
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
