import fs from "node:fs/promises";
import path from "node:path";
import { loadLocalEnv } from "./load-env";
import { parseWooCsv } from "./parse-csv";
import { parseWooXml } from "./parse-xml";
import {
  DATA_DIR,
  INGEST_FILE,
  INGEST_REPORT_FILE,
  RAW_CSV_DIR,
  RAW_XML_DIR,
  USER_AGENT,
} from "./paths";
import type { CanonicalSku, IngestFile } from "./types";

loadLocalEnv();

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1]!.startsWith("-")) {
    return process.argv[idx + 1];
  }
  const pref = process.argv.find((a) => a.startsWith(`${flag}=`));
  return pref ? pref.slice(flag.length + 1).replace(/^["']|["']$/g, "") : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

/** Positional: … csv path\to\file.csv  OR  … xml */
function positionalFrom(): { from?: string; file?: string } {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("-") && !a.includes("="));
  if (args[0] === "csv" || args[0] === "xml") {
    return { from: args[0], file: args[1] };
  }
  if (args[0] && /\.(csv|xml)$/i.test(args[0])) {
    return {
      from: args[0].toLowerCase().endsWith(".xml") ? "xml" : "csv",
      file: args[0],
    };
  }
  return {};
}

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(RAW_CSV_DIR, { recursive: true });
  await fs.mkdir(RAW_XML_DIR, { recursive: true });
}

function summarize(skus: CanonicalSku[]) {
  const cats = new Map<string, number>();
  let withBarcode = 0;
  let withImage = 0;
  for (const s of skus) {
    if (s.barcode) withBarcode += 1;
    if (s.imageUrls.length) withImage += 1;
    for (const c of s.categorySlugs) {
      cats.set(c, (cats.get(c) ?? 0) + 1);
    }
  }
  return {
    skuCount: skus.length,
    withBarcode,
    withImage,
    uniqueSkus: new Set(skus.map((s) => s.sku)).size,
    topCategories: [...cats.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([slug, count]) => ({ slug, count })),
  };
}

async function ingestCsv(filePath: string): Promise<CanonicalSku[]> {
  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const text = await fs.readFile(abs, "utf8");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await fs.writeFile(
    path.join(RAW_CSV_DIR, `export-${stamp}.csv`),
    text,
    "utf8"
  );
  return parseWooCsv(text);
}

async function ingestXml(urlOrFile?: string): Promise<CanonicalSku[]> {
  const fromEnv = process.env.VIKTORIJA_XML_URL?.trim();
  const target = urlOrFile || fromEnv;
  if (!target) {
    throw new Error(
      "XML ingest needs --file=… or VIKTORIJA_XML_URL in .env.local"
    );
  }

  let text: string;
  let label: string;
  if (/^https?:\/\//i.test(target)) {
    console.log("Fetching XML feed…");
    const res = await fetch(target, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/xml,text/xml,*/*" },
    });
    text = await res.text();
    if (!res.ok) {
      throw new Error(
        `XML feed HTTP ${res.status}: ${text.slice(0, 200)}. Try CSV or check the token URL.`
      );
    }
    label = "remote-feed";
  } else {
    const abs = path.isAbsolute(target)
      ? target
      : path.join(process.cwd(), target);
    text = await fs.readFile(abs, "utf8");
    label = path.basename(abs);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await fs.writeFile(
    path.join(RAW_XML_DIR, `export-${stamp}.xml`),
    text,
    "utf8"
  );
  console.log(`Saved raw XML snapshot (${label})`);
  return parseWooXml(text);
}

async function main() {
  await ensureDirs();
  const pos = positionalFrom();
  const from = (argValue("--from") || pos.from || "csv").toLowerCase();
  const file = argValue("--file") || pos.file;

  let skus: CanonicalSku[];
  let source: "csv" | "xml";
  let sourceLabel: string;

  if (from === "xml") {
    source = "xml";
    sourceLabel = file || process.env.VIKTORIJA_XML_URL || "xml";
    skus = await ingestXml(file);
  } else if (from === "csv") {
    source = "csv";
    if (!file) {
      throw new Error(
        "CSV ingest requires --file=path/to/export.csv\nExample: npm run catalog:ingest -- --from=csv --file=\"C:\\Users\\…\\export.csv\""
      );
    }
    sourceLabel = file;
    skus = await ingestCsv(file);
  } else {
    throw new Error(`Unknown --from=${from} (use csv or xml)`);
  }

  const ingest: IngestFile = {
    ingestedAt: new Date().toISOString(),
    source,
    sourceLabel,
    skuCount: skus.length,
    skus,
  };

  await fs.writeFile(INGEST_FILE, JSON.stringify(ingest, null, 2), "utf8");
  // Keep last successful parse per source for side-by-side comparison later
  const perSource = path.join(
    DATA_DIR,
    source === "csv" ? "ingest-csv.json" : "ingest-xml.json"
  );
  await fs.writeFile(perSource, JSON.stringify(ingest, null, 2), "utf8");
  const report = {
    ingestedAt: ingest.ingestedAt,
    source,
    sourceLabel,
    ...summarize(skus),
  };
  await fs.writeFile(
    INGEST_REPORT_FILE,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log(`Ingested ${skus.length} SKUs from ${source}`);
  console.log(`Wrote ${INGEST_FILE}`);
  console.log(`Report: ${INGEST_REPORT_FILE}`);
  if (hasFlag("--print-cats")) {
    console.log(report.topCategories);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
