/** Raw product shape from WooCommerce Store API (subset we care about). */
export type WcStoreImage = {
  id: number;
  src: string;
  thumbnail?: string;
  name?: string;
  alt?: string;
};

export type WcStoreTerm = {
  id: number;
  name: string;
  slug: string;
  link?: string;
};

export type WcStoreAttribute = {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: WcStoreTerm[];
};

export type WcStorePrices = {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_minor_unit: number;
};

export type WcStoreProduct = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WcStorePrices;
  images: WcStoreImage[];
  categories: WcStoreTerm[];
  tags: WcStoreTerm[];
  attributes: WcStoreAttribute[];
  variations: number[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
};

export type DiscoveredUrl = {
  id: number;
  slug: string;
  permalink: string;
  name: string;
  categorySlugs: string[];
};

export type UrlsFile = {
  fetchedAt: string;
  total: number;
  products: DiscoveredUrl[];
};

export type RawProductFile = {
  scrapedAt: string;
  source: "wc-store-api";
  product: WcStoreProduct;
};

export type CanonicalVariant = {
  sku: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  options: { name: string; value: string }[];
};

export type CanonicalProduct = {
  sourceId: number;
  sourceUrl: string;
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
  productCount: number;
  skippedCount: number;
  products: CanonicalProduct[];
};

export type UnmappedReport = {
  mappedAt: string;
  excluded: { id: number; handle: string; reason: string }[];
  unmappedCategories: {
    slug: string;
    productCount: number;
    sampleProductIds: number[];
  }[];
  needsReview: { id: number; handle: string; reasons: string[] }[];
  collectionCounts: Record<string, number>;
};
