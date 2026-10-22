import { cache } from "react";
import {
  getProductByHandle as getMockProductByHandle,
  getProductsByCategory as getMockProductsByCategory,
  products as mockProducts,
} from "@/lib/data/products";
import {
  productMatchesCategory,
  type CategoryGroupId,
} from "@/config/store-categories";
import { shopifyServerConfigured } from "@/lib/shopify/config";
import {
  fetchShopifyProductByHandle,
  fetchShopifyProductHandles,
  fetchShopifyProducts,
  fetchShopifyProductsByCategory,
  fetchShopifyNewArrivalsCollection,
  fetchShopifyRecommendations,
  fetchShopifyCollectionProducts,
} from "@/lib/shopify/catalog";
import { toListingProduct } from "@/lib/catalog/listing";
import { selectNewArrivalsShowcase } from "@/lib/catalog/ranking";
import type { Product } from "@/types";

export type CatalogSource = "shopify" | "mock";

let lastCatalogSource: CatalogSource = "mock";

export function getCatalogSource(): CatalogSource {
  return lastCatalogSource;
}

export function isShopifyCatalogActive(): boolean {
  return lastCatalogSource === "shopify";
}

export { getEnrichedNavCategories } from "@/lib/catalog/categories";

export const getAllProducts = cache(async function getAllProducts() {
  if (shopifyServerConfigured) {
    try {
      const products = await fetchShopifyProducts();
      lastCatalogSource = "shopify";
      return products;
    } catch (e) {
      console.error("[catalog] Shopify fetch failed, using mock:", e);
    }
  }
  lastCatalogSource = "mock";
  return mockProducts;
});

export const getProductByHandle = cache(async function getProductByHandle(handle: string) {
  if (shopifyServerConfigured) {
    try {
      const product = await fetchShopifyProductByHandle(handle);
      lastCatalogSource = "shopify";
      if (product) return product;
      return null;
    } catch (e) {
      console.error("[catalog] Shopify product fetch failed:", e);
    }
  }
  lastCatalogSource = "mock";
  return getMockProductByHandle(handle) ?? null;
});

export async function getRelatedProducts(product: Product, limit = 4) {
  const pick = (list: Product[]) =>
    list
      .filter((p) => p.handle !== product.handle && p.availableForSale !== false)
      .slice(0, limit)
      .map(toListingProduct);

  if (shopifyServerConfigured && product.id.startsWith("gid://")) {
    try {
      const recommended = await fetchShopifyRecommendations(product.id);
      const fromRecs = pick(recommended);
      if (fromRecs.length > 0) return fromRecs;
    } catch (e) {
      console.error("[catalog] Recommendations failed:", e);
    }

    if (product.collection) {
      try {
        const fromCollection = await fetchShopifyCollectionProducts(
          product.collection,
          12
        );
        const picked = pick(fromCollection);
        if (picked.length > 0) return picked;
      } catch (e) {
        console.error("[catalog] Related collection failed:", e);
      }
    }
  }

  const all = await getAllProducts();
  return pick(
    all.filter((p) => {
      if (product.category && product.category !== "all") {
        return productMatchesCategory(p, product.category);
      }
      return Boolean(product.collection) && p.collection === product.collection;
    })
  );
}

export async function getProductsByCategory(categorySlug: string) {
  if (shopifyServerConfigured) {
    try {
      const list = await fetchShopifyProductsByCategory(categorySlug);
      lastCatalogSource = "shopify";
      return list;
    } catch (e) {
      console.error("[catalog] Shopify collection fetch failed:", e);
    }
  }
  lastCatalogSource = "mock";
  return getMockProductsByCategory(categorySlug);
}

export async function getProductsByGroup(groupId: CategoryGroupId) {
  if (shopifyServerConfigured) {
    try {
      const grouped = await fetchShopifyProductsByCategory(groupId);
      lastCatalogSource = "shopify";
      return grouped;
    } catch (e) {
      console.error("[catalog] Shopify group fetch failed:", e);
    }
  }

  lastCatalogSource = "mock";
  return mockProducts.filter((p) => productMatchesCategory(p, groupId));
}

export async function getProductHandles(): Promise<string[]> {
  if (shopifyServerConfigured) {
    try {
      const handles = await fetchShopifyProductHandles();
      lastCatalogSource = "shopify";
      return handles;
    } catch (e) {
      console.error("[catalog] Shopify handles fetch failed:", e);
    }
  }
  lastCatalogSource = "mock";
  return mockProducts.map((p) => p.handle);
}

export async function getNewArrivalsProducts(all?: Product[]) {
  if (shopifyServerConfigured) {
    try {
      const fromCollection = await fetchShopifyNewArrivalsCollection();
      if (fromCollection.length > 0) {
        lastCatalogSource = "shopify";
        return fromCollection.filter(
          (p) => Boolean(p.image?.trim()) && p.availableForSale !== false
        );
      }
    } catch (e) {
      console.error("[catalog] New arrivals collection failed:", e);
    }
  }

  const catalog = all ?? (await getAllProducts());
  return selectNewArrivalsShowcase(catalog);
}
