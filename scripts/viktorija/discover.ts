import fs from "node:fs/promises";
import { fetchJson } from "./http";
import { DATA_DIR, STORE_API, URLS_FILE } from "./paths";
import type { DiscoveredUrl, UrlsFile, WcStoreProduct } from "./types";

const PER_PAGE = 100;

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function main() {
  await ensureDirs();
  console.log("Discovering products via WooCommerce Store API…");

  const firstUrl = `${STORE_API}/products?per_page=${PER_PAGE}&page=1`;
  const first = await fetchJson<WcStoreProduct[]>(firstUrl);
  const totalHeader = first.headers.get("X-WP-Total");
  const pagesHeader = first.headers.get("X-WP-TotalPages");
  const total = totalHeader ? Number(totalHeader) : first.data.length;
  const totalPages = pagesHeader
    ? Number(pagesHeader)
    : Math.ceil(total / PER_PAGE);

  console.log(`Total products: ${total} across ${totalPages} pages`);

  const byId = new Map<number, DiscoveredUrl>();

  const ingest = (products: WcStoreProduct[]) => {
    for (const p of products) {
      byId.set(p.id, {
        id: p.id,
        slug: p.slug,
        permalink: p.permalink,
        name: p.name,
        categorySlugs: (p.categories ?? []).map((c) => c.slug),
      });
    }
  };

  ingest(first.data);

  for (let page = 2; page <= totalPages; page++) {
    const url = `${STORE_API}/products?per_page=${PER_PAGE}&page=${page}`;
    console.log(`  page ${page}/${totalPages}`);
    const { data } = await fetchJson<WcStoreProduct[]>(url);
    ingest(data);
  }

  const products = [...byId.values()].sort((a, b) => a.id - b.id);
  const payload: UrlsFile = {
    fetchedAt: new Date().toISOString(),
    total: products.length,
    products,
  };

  await fs.writeFile(URLS_FILE, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${products.length} URLs → ${URLS_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
