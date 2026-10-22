import fs from "node:fs/promises";
import { loadLocalEnv } from "./load-env";
import { diffSkuIndexes } from "./diff";
import { buildSkuIndex } from "./fingerprint";
import {
  CANONICAL_FILE,
  DATA_DIR,
  DIFF_FILE,
  PREVIOUS_CANONICAL_FILE,
  SKU_INDEX_FILE,
} from "./paths";
import { fetchShopifySkuIndex } from "./shopify-index";
import type { CanonicalFile, SkuIndexFile } from "./types";

loadLocalEnv();

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  const pref = process.argv.find((a) => a.startsWith(`${flag}=`));
  return pref ? pref.slice(flag.length + 1) : undefined;
}

async function loadSourceIndex(): Promise<SkuIndexFile> {
  try {
    return JSON.parse(await fs.readFile(SKU_INDEX_FILE, "utf8")) as SkuIndexFile;
  } catch {
    const canonical = JSON.parse(
      await fs.readFile(CANONICAL_FILE, "utf8")
    ) as CanonicalFile;
    return buildSkuIndex(canonical);
  }
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const against = (argValue("--against") || "snapshot").toLowerCase();
  const source = await loadSourceIndex();

  let remote: SkuIndexFile;
  let label: "snapshot" | "shopify";

  if (against === "shopify") {
    console.log("Fetching Shopify catalog by SKU…");
    remote = await fetchShopifySkuIndex();
    label = "shopify";
  } else {
    label = "snapshot";
    try {
      const prev = JSON.parse(
        await fs.readFile(PREVIOUS_CANONICAL_FILE, "utf8")
      ) as CanonicalFile;
      remote = buildSkuIndex(prev);
    } catch {
      remote = { mappedAt: "", count: 0, bySku: {} };
      console.log("No previous canonical — all SKUs will show as new.");
    }
  }

  const report = diffSkuIndexes(source, remote, label);
  await fs.writeFile(DIFF_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log(`Diff vs ${label}:`, report.counts);
  console.log(`Wrote ${DIFF_FILE}`);

  const interesting = report.entries.filter((e) => e.status !== "unchanged");
  for (const e of interesting.slice(0, 30)) {
    console.log(
      `  [${e.status}] ${e.sku} ${e.title ?? ""} ${e.reasons?.join(",") ?? ""}`
    );
  }
  if (interesting.length > 30) {
    console.log(`  … +${interesting.length - 30} more (see diff-report.json)`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
