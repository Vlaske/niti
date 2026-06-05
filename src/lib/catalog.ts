import {
  getProductByHandle as getMockProductByHandle,
  getProductsByCategory as getMockProductsByCategory,
  products as mockProducts,
} from "@/lib/data/products";
import { shopifyServerConfigured } from "@/lib/shopify/config";
import {
  fetchShopifyProductByHandle,
  fetchShopifyProductHandles,
  fetchShopifyProducts,
  fetchShopifyProductsByCategory,
} from "@/lib/shopify/catalog";

export type CatalogSource = "shopify" | "mock";

let lastCatalogSource: CatalogSource = "mock";

export function getCatalogSource(): CatalogSource {
  return lastCatalogSource;
}

export function isShopifyCatalogActive(): boolean {
  return lastCatalogSource === "shopify";
}

export { getEnrichedNavCategories } from "@/lib/catalog/categories";

export async function getAllProducts() {
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
}

export async function getProductByHandle(handle: string) {
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
