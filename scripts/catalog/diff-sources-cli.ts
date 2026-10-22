/**
 * Compare last CSV ingest vs last XML ingest by SKU (when both exist).
 *   npm run catalog:diff-sources
 */
import fs from "node:fs/promises";
import path from "node:path";
import { diffSkuIndexes } from "./diff";
import { mergeSkus } from "./merge";
import { buildSkuIndex } from "./fingerprint";
import { DATA_DIR, DIFF_FILE } from "./paths";
import type { CanonicalFile, IngestFile } from "./types";

async function indexFromIngest(file: string) {
  const ingest = JSON.parse(await fs.readFile(file, "utf8")) as IngestFile;
  const { products } = mergeSkus(ingest.skus);
  const canonical: CanonicalFile = {
    mappedAt: ingest.ingestedAt,
    productCount: products.length,
    skippedCount: 0,
    products,
  };
  return buildSkuIndex(canonical);
}

async function main() {
  const csvPath = path.join(DATA_DIR, "ingest-csv.json");
  const xmlPath = path.join(DATA_DIR, "ingest-xml.json");
  let csv: Awaited<ReturnType<typeof indexFromIngest>>;
  let xml: Awaited<ReturnType<typeof indexFromIngest>>;
  try {
    csv = await indexFromIngest(csvPath);
  } catch {
    throw new Error(`Missing ${csvPath}. Run: npm run catalog:ingest -- csv …`);
  }
  try {
    xml = await indexFromIngest(xmlPath);
  } catch {
    throw new Error(
      `Missing ${xmlPath}. Run: npm run catalog:ingest -- xml (set VIKTORIJA_XML_URL)`
    );
  }

  // Treat CSV as source, XML as remote for labeling
  const report = diffSkuIndexes(csv, xml, "snapshot");
  const out = path.join(DATA_DIR, "diff-csv-vs-xml.json");
  await fs.writeFile(out, JSON.stringify(report, null, 2), "utf8");
  console.log("CSV vs XML SKU diff:", report.counts);
  console.log(`Wrote ${out}`);
  void DIFF_FILE;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
