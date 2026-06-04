import { shopifyFetch } from "@/lib/shopify/client";
import { CATEGORY_COLLECTION_HANDLES } from "@/lib/shopify/config";
import { mapShopifyProduct, type ShopifyProductNode } from "@/lib/shopify/mappers";
import {
  COLLECTION_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
} from "@/lib/shopify/queries";
import type { Product } from "@/types";

const PAGE_SIZE = 50;

type ProductsResponse = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ShopifyProductNode[];
  };
};

type ProductResponse = {
  product: ShopifyProductNode | null;
};

type CollectionResponse = {
  collection: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: ShopifyProductNode[];
    };
  } | null;
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
    if (nodes.length > 250) break;
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

export async function fetchShopifyProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const collectionHandle =
    CATEGORY_COLLECTION_HANDLES[categorySlug] ?? categorySlug;

  const data = await shopifyFetch<CollectionResponse>(
    COLLECTION_PRODUCTS_QUERY,
    { handle: collectionHandle, first: PAGE_SIZE, after: null }
  );

  if (!data.collection) return [];

  const nodes: ShopifyProductNode[] = [...data.collection.products.nodes];
  let hasNext = data.collection.products.pageInfo.hasNextPage;
  let after = data.collection.products.pageInfo.endCursor;

  while (hasNext && nodes.length < 200) {
    const next: CollectionResponse = await shopifyFetch<CollectionResponse>(
      COLLECTION_PRODUCTS_QUERY,
      { handle: collectionHandle, first: PAGE_SIZE, after }
    );
    if (!next.collection) break;
    nodes.push(...next.collection.products.nodes);
    hasNext = next.collection.products.pageInfo.hasNextPage;
    after = next.collection.products.pageInfo.endCursor;
  }

  return nodes.map(mapShopifyProduct);
}

export async function fetchShopifyProductHandles(): Promise<string[]> {
  const products = await fetchShopifyProducts();
  return products.map((p) => p.handle);
}
