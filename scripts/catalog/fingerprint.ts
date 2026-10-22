import type { CanonicalFile, CanonicalProduct, SkuIndexEntry, SkuIndexFile } from "./types";

/** Stable fingerprint for change detection (price/title/tags/images/options). */
export function productFingerprint(product: CanonicalProduct): string {
  const variantPart = product.variants
    .map(
      (v) =>
        `${v.sku}|${v.price}|${v.compareAtPrice ?? ""}|${v.barcode ?? ""}|${v.options
          .map((o) => `${o.name}=${o.value}`)
          .join(";")}`
    )
    .sort()
    .join(",");
  const imgPart = product.images.map((i) => i.src).join(",");
  const tagPart = [...product.tags].sort().join(",");
  return [
    product.handle,
    product.title,
    product.collectionHandle,
    tagPart,
    imgPart,
    variantPart,
  ].join("::");
}

export function buildSkuIndex(canonical: CanonicalFile): SkuIndexFile {
  const bySku: Record<string, SkuIndexEntry> = {};
  for (const p of canonical.products) {
    for (const v of p.variants) {
      if (!v.sku) continue;
      bySku[v.sku] = {
        sku: v.sku,
        handle: p.handle,
        sourceWooId: v.sourceWooId,
        barcode: v.barcode,
        price: v.price,
        collectionHandle: p.collectionHandle,
        title: p.title,
      };
    }
  }
  return {
    mappedAt: canonical.mappedAt,
    count: Object.keys(bySku).length,
    bySku,
  };
}

export function skuFingerprint(entry: SkuIndexEntry): string {
  return [
    entry.handle,
    entry.title,
    entry.collectionHandle,
    entry.price,
    entry.barcode ?? "",
  ].join("::");
}
