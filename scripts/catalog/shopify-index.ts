import { adminConfigured, adminGraphql } from "./admin";
import type { SkuIndexEntry, SkuIndexFile } from "./types";

type ProductNode = {
  handle: string;
  title: string;
  tags: string[];
  variants: {
    nodes: {
      sku: string | null;
      barcode: string | null;
      price: string;
    }[];
  };
};

type ProductsQuery = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ProductNode[];
  };
};

const QUERY = `#graphql
  query CatalogDiffProducts($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        handle
        title
        tags
        variants(first: 100) {
          nodes { sku barcode price }
        }
      }
    }
  }
`;

function nitiCollectionFromTags(tags: string[]): string {
  const niti = tags.find((t) => t.startsWith("niti:"));
  return niti ? niti.slice("niti:".length) : "";
}

/** Pull live Shopify catalog into a SKU index (Admin API). */
export async function fetchShopifySkuIndex(): Promise<SkuIndexFile> {
  if (!adminConfigured()) {
    throw new Error(
      "Shopify Admin not configured. Set SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (or SHOPIFY_ADMIN_ACCESS_TOKEN) in .env.local"
    );
  }

  const bySku: Record<string, SkuIndexEntry> = {};
  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: ProductsQuery = await adminGraphql<ProductsQuery>(QUERY, {
      cursor,
    });
    for (const p of data.products.nodes) {
      const collectionHandle = nitiCollectionFromTags(p.tags);
      for (const v of p.variants.nodes) {
        const sku = (v.sku ?? "").trim();
        if (!sku) continue;
        bySku[sku] = {
          sku,
          handle: p.handle,
          barcode: v.barcode ?? undefined,
          price: Number(v.price) || 0,
          collectionHandle,
          title: p.title,
        };
      }
    }
    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return {
    mappedAt: new Date().toISOString(),
    count: Object.keys(bySku).length,
    bySku,
  };
}
