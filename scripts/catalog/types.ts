/** Canonical catalog types for local CSV/XML → Shopify pipeline. */

export type CanonicalSku = {
  /** WooCommerce post ID when known */
  sourceId: number;
  sku: string;
  barcode?: string;
  title: string;
  descriptionHtml: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  /** Woo category slugs (normalized) */
  categorySlugs: string[];
  /** Original category path strings from export */
  categoryPaths: string[];
  attributes: Record<string, string>;
  imageUrls: string[];
  sourceUrl?: string;
  published: boolean;
  /** csv | xml | scrape */
  source: "csv" | "xml" | "scrape";
};

export type CanonicalVariant = {
  sku: string;
  barcode?: string;
  sourceWooId?: number;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  options: { name: string; value: string }[];
  image?: string;
};

export type CanonicalProduct = {
  sourceId: number;
  sourceUrl?: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  collectionHandle: string;
  tags: string[];
  sourceCategorySlugs: string[];
  images: { src: string; alt: string; localPath?: string }[];
  options: { name: string; values: string[] }[];
  variants: CanonicalVariant[];
  attributes: Record<string, string>;
  published: boolean;
  status: "active" | "draft";
  needsReview?: string[];
};

export type CanonicalFile = {
  mappedAt: string;
  source?: string;
  productCount: number;
  skippedCount: number;
  products: CanonicalProduct[];
};

export type SkuIndexEntry = {
  sku: string;
  handle: string;
  sourceWooId?: number;
  barcode?: string;
  price: number;
  collectionHandle: string;
  title: string;
};

export type SkuIndexFile = {
  mappedAt: string;
  count: number;
  bySku: Record<string, SkuIndexEntry>;
};

export type UnmappedReport = {
  mappedAt: string;
  excluded: { id: number; sku: string; handle: string; reason: string }[];
  unmappedCategories: {
    slug: string;
    productCount: number;
    sampleSkus: string[];
  }[];
  needsReview: { id: number; handle: string; reasons: string[] }[];
  collectionCounts: Record<string, number>;
  skuCollisions: { sku: string; sourceIds: number[] }[];
};

export type DiffStatus =
  | "new"
  | "changed"
  | "unchanged"
  | "missing_in_source"
  | "collision";

export type DiffEntry = {
  sku: string;
  status: DiffStatus;
  handle?: string;
  title?: string;
  reasons?: string[];
  source?: Partial<SkuIndexEntry>;
  remote?: Partial<SkuIndexEntry>;
};

export type DiffReport = {
  comparedAt: string;
  against: "snapshot" | "shopify";
  counts: Record<DiffStatus, number>;
  entries: DiffEntry[];
};

export type IngestFile = {
  ingestedAt: string;
  source: "csv" | "xml";
  sourceLabel: string;
  skuCount: number;
  skus: CanonicalSku[];
};
