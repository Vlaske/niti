import fs from "node:fs/promises";
import path from "node:path";
import { fetchJson } from "./http";
import {
  DATA_DIR,
  RAW_DIR,
  SCRAPE_LOG_FILE,
  STORE_API,
  URLS_FILE,
} from "./paths";
import type {
  RawProductFile,
  UrlsFile,
  WcStoreProduct,
} from "./types";

const PER_PAGE = 100;

type ScrapeLog = {
  updatedAt: string;
  ok: number[];
  failed: { id: number; error: string }[];
};

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(RAW_DIR, { recursive: true });
  await fs.mkdir(DATA_DIR, { recursive: true });

  if (!(await fileExists(URLS_FILE))) {
    console.error(`Missing ${URLS_FILE}. Run: npm run import:viktorija:discover`);
    process.exit(1);
  }

  const urls = JSON.parse(await fs.readFile(URLS_FILE, "utf8")) as UrlsFile;
  const force = process.argv.includes("--force");
  const limitEq = process.argv.find((a) => a.startsWith("--limit="));
  const limitIdx = process.argv.indexOf("--limit");
  const limit = limitEq
    ? Number(limitEq.split("=")[1])
    : limitIdx >= 0
      ? Number(process.argv[limitIdx + 1])
      : undefined;

  let targets = urls.products;
  if (limit && Number.isFinite(limit)) {
    targets = targets.slice(0, limit);
    console.log(`Limiting scrape to first ${targets.length} products`);
  }

  const log: ScrapeLog = {
    updatedAt: new Date().toISOString(),
    ok: [],
    failed: [],
  };

  // Prefer bulk pages (faster) then fill gaps by id
  const idSet = new Set(targets.map((t) => t.id));
  const totalPages = Math.ceil(urls.total / PER_PAGE) || 1;

  console.log(
    `Scraping ${idSet.size} products (resume=${!force}, pages≈${totalPages})…`
  );

  for (let page = 1; page <= totalPages; page++) {
    const pageUrl = `${STORE_API}/products?per_page=${PER_PAGE}&page=${page}`;
    console.log(`  page ${page}/${totalPages}`);
    let products: WcStoreProduct[] = [];
    try {
      const res = await fetchJson<WcStoreProduct[]>(pageUrl);
      products = res.data;
    } catch (err) {
      console.warn(`  page ${page} failed: ${String(err)}`);
      continue;
    }

    for (const product of products) {
      if (!idSet.has(product.id)) continue;
      const outPath = path.join(RAW_DIR, `${product.id}.json`);
      if (!force && (await fileExists(outPath))) {
        log.ok.push(product.id);
        continue;
      }
      const payload: RawProductFile = {
        scrapedAt: new Date().toISOString(),
        source: "wc-store-api",
        product,
      };
      await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
      log.ok.push(product.id);
      idSet.delete(product.id);
    }
  }

  // Resume / fill any missing via single-product endpoint
  const stillMissing: typeof targets = [];
  for (const t of targets) {
    const outPath = path.join(RAW_DIR, `${t.id}.json`);
    if (!force && (await fileExists(outPath))) continue;
    stillMissing.push(t);
  }

  if (stillMissing.length) {
    console.log(`Fetching ${stillMissing.length} missing products by id…`);
    for (const t of stillMissing) {
      const outPath = path.join(RAW_DIR, `${t.id}.json`);
      try {
        const { data } = await fetchJson<WcStoreProduct>(
          `${STORE_API}/products/${t.id}`
        );
        const payload: RawProductFile = {
          scrapedAt: new Date().toISOString(),
          source: "wc-store-api",
          product: data,
        };
        await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
        log.ok.push(t.id);
      } catch (err) {
        log.failed.push({ id: t.id, error: String(err) });
        console.warn(`  fail ${t.id}: ${String(err)}`);
      }
    }
  }

  log.updatedAt = new Date().toISOString();
  log.ok = [...new Set(log.ok)];
  await fs.writeFile(SCRAPE_LOG_FILE, JSON.stringify(log, null, 2), "utf8");
  console.log(
    `Done. ok=${log.ok.length} failed=${log.failed.length} → ${RAW_DIR}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
