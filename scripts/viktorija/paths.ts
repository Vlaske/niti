import path from "node:path";

/** Always resolve from repo root (npm scripts run with cwd = project root). */
export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data", "viktorija");
export const RAW_DIR = path.join(DATA_DIR, "raw");
export const IMAGES_DIR = path.join(DATA_DIR, "images");
export const URLS_FILE = path.join(DATA_DIR, "urls.json");
export const CANONICAL_FILE = path.join(DATA_DIR, "canonical.json");
export const UNMAPPED_FILE = path.join(DATA_DIR, "unmapped-report.json");
export const SHOPIFY_CSV_FILE = path.join(DATA_DIR, "shopify-products.csv");
export const SHOPIFY_COLLECTIONS_CSV_FILE = path.join(
  DATA_DIR,
  "shopify-collections.csv"
);
export const IMAGES_AI_DIR = path.join(DATA_DIR, "images-ai");
export const SCRAPE_LOG_FILE = path.join(DATA_DIR, "scrape-log.json");

export const STORE_API =
  "https://www.viktorijaleskovac.rs/wp-json/wc/store/v1";

export const USER_AGENT =
  "NITI-local-import/1.0 (+local catalog sync; contact via store owner)";
