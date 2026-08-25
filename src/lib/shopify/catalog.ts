import { productMatchesCategory } from "@/config/store-categories";
import { shopifyFetch } from "@/lib/shopify/client";
import { mapShopifyProduct, type ShopifyProductNode } from "@/lib/shopify/mappers";
import {
  COLLECTION_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
} from "@/lib/shopify/queries";
import type { Product } from "@/types";

const PAGE_SIZE = 100;
const MAX_PRODUCTS = 3000;

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
 * Always filter from the full mapped catalog.
 * Collection-handle fetches miss products that Shopify placed in the wrong
 * collection, while our title/tag heuristics still classify them correctly.
 */
export async function fetchShopifyProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const all = await fetchShopifyProducts();
  return all.filter((p) => productMatchesCategory(p, categorySlug));
}

export async function fetchShopifyProductHandles(): Promise<string[]> {
  const products = await fetchShopifyProducts();
  return products.map((p) => p.handle);
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
