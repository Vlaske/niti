import fs from "node:fs/promises";
import {
  buildShopifyCollectionsCsv,
  buildShopifyProductsCsv,
} from "./export-shopify";
import {
  CANONICAL_FILE,
  DATA_DIR,
  SHOPIFY_COLLECTIONS_CSV_FILE,
  SHOPIFY_CSV_FILE,
} from "./paths";
import type { CanonicalFile } from "./types";

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const canonical = JSON.parse(
    await fs.readFile(CANONICAL_FILE, "utf8")
  ) as CanonicalFile;

  const productsCsv = buildShopifyProductsCsv(canonical);
  const collectionsCsv = buildShopifyCollectionsCsv();

  await fs.writeFile(SHOPIFY_CSV_FILE, productsCsv, "utf8");
  await fs.writeFile(SHOPIFY_COLLECTIONS_CSV_FILE, collectionsCsv, "utf8");

  console.log(
    `Exported ${canonical.productCount} products → ${SHOPIFY_CSV_FILE}`
  );
  console.log(`Collections → ${SHOPIFY_COLLECTIONS_CSV_FILE}`);
  console.log(
    "Import collections first in Shopify Admin, then products. Publish to Headless channel."
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
