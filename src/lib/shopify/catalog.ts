import {
  getCollectionHandlesForSlug,
  productMatchesCategory,
} from "@/config/store-categories";
import { shopifyFetch } from "@/lib/shopify/client";
import { mapShopifyProduct, type ShopifyProductNode } from "@/lib/shopify/mappers";
import {
  COLLECTION_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_HANDLES_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  PRODUCTS_QUERY,
} from "@/lib/shopify/queries";
import type { Product } from "@/types";

const PAGE_SIZE = 100;
const MAX_PRODUCTS = 3000;
const HANDLES_PAGE = 250;

type ProductsResponse = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ShopifyProductNode[];
  };
};

type ProductResponse = {
  product: ShopifyProductNode | null;
};

async function fetchAllProductNodes(): Promise<ShopifyProductNode[]> {
  const nodes: ShopifyProductNode[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: ProductsResponse = await shopifyFetch<ProductsResponse>(
      PRODUCTS_QUERY,
      {
        first: PAGE_SIZE,
        after,
      }
    );

    nodes.push(...data.products.nodes);
    hasNext = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
    if (nodes.length >= MAX_PRODUCTS) break;
  }

  return nodes;
}

export async function fetchShopifyProducts(): Promise<Product[]> {
  const nodes = await fetchAllProductNodes();
  return nodes.map(mapShopifyProduct);
}

export async function fetchShopifyProductByHandle(
  handle: string
): Promise<Product | null> {
  const data = await shopifyFetch<ProductResponse>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
  if (!data.product) return null;
  return mapShopifyProduct(data.product);
}

/**
 * Prefer Shopify collection fetches (fast) for category/group pages.
 * Fall back to full-catalog filter only when collections return nothing —
 * misplaced products still show via that path.
 */
export async function fetchShopifyProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const handles = getCollectionHandlesForSlug(categorySlug);
  const lists = await Promise.all(
    handles.map((handle) =>
      fetchShopifyCollectionProducts(handle, 250).catch(() => [] as Product[])
    )
  );

  const byId = new Map<string, Product>();
  for (const list of lists) {
    for (const product of list) byId.set(product.id, product);
  }

  const fromCollections = [...byId.values()].filter((p) =>
    productMatchesCategory(p, categorySlug)
  );

  if (fromCollections.length > 0) return fromCollections;

  const all = await fetchShopifyProducts();
  return all.filter((p) => productMatchesCategory(p, categorySlug));
}

export type ShopifyProductHandleRow = {
  handle: string;
  updatedAt?: string;
};

export async function fetchShopifyProductHandles(): Promise<string[]> {
  const rows = await fetchShopifyProductHandleRows();
  return rows.map((r) => r.handle);
}

type HandlesResponse = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: { handle: string; updatedAt?: string }[];
  };
};

/** Lean handles list for sitemap / static params — not the full catalog. */
export async function fetchShopifyProductHandleRows(): Promise<
  ShopifyProductHandleRow[]
> {
  const rows: ShopifyProductHandleRow[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: HandlesResponse = await shopifyFetch<HandlesResponse>(
      PRODUCT_HANDLES_QUERY,
      { first: HANDLES_PAGE, after },
      { revalidate: 300 }
    );

    for (const n of data.products.nodes) {
      rows.push({ handle: n.handle, updatedAt: n.updatedAt });
    }
    hasNext = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
    if (rows.length >= MAX_PRODUCTS) break;
  }

  return rows;
}

type CollectionProductsResponse = {
  collection: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: ShopifyProductNode[];
    };
  } | null;
};

/** Only the dedicated homepage showcase collection — not Shopify’s default Home page. */
export const NEW_ARRIVALS_COLLECTION_HANDLES = ["novo-u-ponudi"] as const;

export async function fetchShopifyCollectionProducts(
  handle: string,
  max = 48
): Promise<Product[]> {
  const nodes: ShopifyProductNode[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext && nodes.length < max) {
    const data: CollectionProductsResponse = await shopifyFetch(
      COLLECTION_PRODUCTS_QUERY,
      { handle, first: Math.min(50, max - nodes.length), after },
      { revalidate: 60 }
    );

    if (!data.collection) return [];
    nodes.push(...data.collection.products.nodes);
    hasNext = data.collection.products.pageInfo.hasNextPage;
    after = data.collection.products.pageInfo.endCursor;
  }

  return nodes.map(mapShopifyProduct);
}

export async function fetchShopifyRecommendations(
  productId: string
): Promise<Product[]> {
  const data = await shopifyFetch<{
    productRecommendations: ShopifyProductNode[] | null;
  }>(PRODUCT_RECOMMENDATIONS_QUERY, { productId }, { revalidate: 60 });

  return (data.productRecommendations ?? []).map(mapShopifyProduct);
}

export async function fetchShopifyNewArrivalsCollection(): Promise<Product[]> {
  for (const handle of NEW_ARRIVALS_COLLECTION_HANDLES) {
    try {
      const list = await fetchShopifyCollectionProducts(handle, 24);
      if (list.length > 0) return list;
    } catch {
      // try next handle
    }
  }
  return [];
}
