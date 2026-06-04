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
import type { Product } from "@/types";

export async function getAllProducts(): Promise<Product[]> {
  if (shopifyServerConfigured) {
    try {
      return await fetchShopifyProducts();
    } catch (e) {
      console.error("[catalog] Shopify fetch failed, using mock:", e);
    }
  }
  return mockProducts;
}

export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  if (shopifyServerConfigured) {
    try {
      const product = await fetchShopifyProductByHandle(handle);
      if (product) return product;
    } catch (e) {
      console.error("[catalog] Shopify product fetch failed:", e);
    }
  }
  return getMockProductByHandle(handle) ?? null;
}

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  if (shopifyServerConfigured) {
    try {
      const list = await fetchShopifyProductsByCategory(categorySlug);
      if (list.length > 0) return list;
    } catch (e) {
      console.error("[catalog] Shopify collection fetch failed:", e);
    }
  }
  return getMockProductsByCategory(categorySlug);
}

export async function getProductHandles(): Promise<string[]> {
  if (shopifyServerConfigured) {
    try {
      return await fetchShopifyProductHandles();
    } catch (e) {
      console.error("[catalog] Shopify handles fetch failed:", e);
    }
  }
  return mockProducts.map((p) => p.handle);
}

export function isShopifyCatalogActive(): boolean {
  return shopifyServerConfigured;
}
