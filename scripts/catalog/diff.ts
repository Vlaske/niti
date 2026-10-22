import type {
  DiffEntry,
  DiffReport,
  DiffStatus,
  SkuIndexFile,
} from "./types";
import { skuFingerprint } from "./fingerprint";

function emptyCounts(): Record<DiffStatus, number> {
  return {
    new: 0,
    changed: 0,
    unchanged: 0,
    missing_in_source: 0,
    collision: 0,
  };
}

/** Diff two SKU indexes (canonical vs previous snapshot or Shopify). */
export function diffSkuIndexes(
  source: SkuIndexFile,
  remote: SkuIndexFile,
  against: DiffReport["against"]
): DiffReport {
  const entries: DiffEntry[] = [];
  const counts = emptyCounts();
  const sourceSkus = new Set(Object.keys(source.bySku));
  const remoteSkus = new Set(Object.keys(remote.bySku));

  for (const sku of sourceSkus) {
    const src = source.bySku[sku]!;
    const rem = remote.bySku[sku];
    if (!rem) {
      entries.push({
        sku,
        status: "new",
        handle: src.handle,
        title: src.title,
        source: src,
      });
      counts.new += 1;
      continue;
    }
    if (skuFingerprint(src) !== skuFingerprint(rem)) {
      const reasons: string[] = [];
      if (src.price !== rem.price) reasons.push("price");
      if (src.title !== rem.title) reasons.push("title");
      if (src.handle !== rem.handle) reasons.push("handle");
      if (src.collectionHandle !== rem.collectionHandle)
        reasons.push("collection");
      if ((src.barcode ?? "") !== (rem.barcode ?? "")) reasons.push("barcode");
      entries.push({
        sku,
        status: "changed",
        handle: src.handle,
        title: src.title,
        reasons,
        source: src,
        remote: rem,
      });
      counts.changed += 1;
    } else {
      entries.push({
        sku,
        status: "unchanged",
        handle: src.handle,
        title: src.title,
        source: src,
        remote: rem,
      });
      counts.unchanged += 1;
    }
  }

  for (const sku of remoteSkus) {
    if (sourceSkus.has(sku)) continue;
    const rem = remote.bySku[sku]!;
    entries.push({
      sku,
      status: "missing_in_source",
      handle: rem.handle,
      title: rem.title,
      remote: rem,
    });
    counts.missing_in_source += 1;
  }

  entries.sort((a, b) => a.sku.localeCompare(b.sku));

  return {
    comparedAt: new Date().toISOString(),
    against,
    counts,
    entries,
  };
}
