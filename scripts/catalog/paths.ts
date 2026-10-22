import path from "node:path";

/** Always resolve from repo root (npm scripts run with cwd = project root). */
export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data", "viktorija");
export const RAW_DIR = path.join(DATA_DIR, "raw");
export const RAW_CSV_DIR = path.join(DATA_DIR, "raw-csv");
export const RAW_XML_DIR = path.join(DATA_DIR, "raw-xml");
export const IMAGES_DIR = path.join(DATA_DIR, "images");
export const IMAGES_AI_DIR = path.join(DATA_DIR, "images-ai");

export const INGEST_FILE = path.join(DATA_DIR, "ingest.json");
export const CANONICAL_FILE = path.join(DATA_DIR, "canonical.json");
export const PREVIOUS_CANONICAL_FILE = path.join(
  DATA_DIR,
  "canonical.previous.json"
);
export const SKU_INDEX_FILE = path.join(DATA_DIR, "sku-index.json");
export const UNMAPPED_FILE = path.join(DATA_DIR, "unmapped-report.json");
export const DIFF_FILE = path.join(DATA_DIR, "diff-report.json");
export const EXCLUSIONS_FILE = path.join(DATA_DIR, "exclusions.json");
export const INGEST_REPORT_FILE = path.join(DATA_DIR, "ingest-report.json");

export const SHOPIFY_CSV_FILE = path.join(DATA_DIR, "shopify-products.csv");
export const SHOPIFY_COLLECTIONS_CSV_FILE = path.join(
  DATA_DIR,
  "shopify-collections.csv"
);

export const STUDIO_HOST = "127.0.0.1";
export const STUDIO_PORT = 3847;

export const USER_AGENT =
  "NITI-local-catalog/1.0 (+local import only; never deployed)";
