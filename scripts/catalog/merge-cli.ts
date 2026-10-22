import fs from "node:fs/promises";
import { mergeSkus } from "./merge";
import { buildSkuIndex } from "./fingerprint";
import {
  CANONICAL_FILE,
  DATA_DIR,
  INGEST_FILE,
  PREVIOUS_CANONICAL_FILE,
  SKU_INDEX_FILE,
  UNMAPPED_FILE,
} from "./paths";
import type { CanonicalFile, IngestFile, UnmappedReport } from "./types";

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  let ingest: IngestFile;
  try {
    ingest = JSON.parse(await fs.readFile(INGEST_FILE, "utf8")) as IngestFile;
  } catch {
    throw new Error(
      `Missing ${INGEST_FILE}. Run: npm run catalog:ingest -- --from=csv --file=…`
    );
  }

  // Keep previous canonical for local diffs
  try {
    await fs.copyFile(CANONICAL_FILE, PREVIOUS_CANONICAL_FILE);
  } catch {
    /* first run */
  }

  const { products, report, draftCount } = mergeSkus(ingest.skus);
  const mappedAt = new Date().toISOString();

  const canonical: CanonicalFile = {
    mappedAt,
    source: `${ingest.source}:${ingest.sourceLabel}`,
    productCount: products.length,
    skippedCount: report.excluded.length + report.unmappedCategories.reduce(
      (n, c) => n + c.productCount,
      0
    ),
    products,
  };

  const fullReport: UnmappedReport = { mappedAt, ...report };
  const skuIndex = buildSkuIndex(canonical);

  await fs.writeFile(CANONICAL_FILE, JSON.stringify(canonical, null, 2), "utf8");
  await fs.writeFile(UNMAPPED_FILE, JSON.stringify(fullReport, null, 2), "utf8");
  await fs.writeFile(SKU_INDEX_FILE, JSON.stringify(skuIndex, null, 2), "utf8");

  const variantCount = products.reduce((n, p) => n + p.variants.length, 0);
  console.log(
    `Merged ${draftCount} SKUs → ${products.length} products (${variantCount} variants)`
  );
  console.log(
    `Excluded=${report.excluded.length} collisions=${report.skuCollisions.length}`
  );
  console.log(`Collections:`, report.collectionCounts);
  console.log(`Wrote ${CANONICAL_FILE}`);
  console.log(`SKU index: ${SKU_INDEX_FILE}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
