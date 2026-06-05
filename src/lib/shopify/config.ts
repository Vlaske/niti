/**
 * Shopify Storefront API configuration.
 *
 * Recommended (2025+): Headless sales channel → private token on server only.
 * Legacy: Custom app → NEXT_PUBLIC_* + X-Shopify-Storefront-Access-Token.
 */

export const SHOPIFY_API_VERSION = "2025-10";

export const shopifyStoreDomain =
  process.env.SHOPIFY_STORE_DOMAIN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ??
  "";

/** Private token — Headless channel; server-side only (preferred). */
export const shopifyPrivateToken =
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "";

/**
 * Public token — optional client-side reads (cart i dalje ide preko servera).
 * Headless Admin često daje hex token bez prefiksa u SHOPIFY_STOREFRONT_PUBLIC_TOKEN.
 */
export const shopifyPublicToken =
  process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
  "";

/** Legacy single token (often same as public). */
const legacyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";

export type ShopifyTokenMode = "private" | "public" | "legacy" | "none";

export function getShopifyTokenMode(): ShopifyTokenMode {
  if (shopifyPrivateToken) {
    if (shopifyPrivateToken.startsWith("shpss_")) return "private";
    if (shopifyPrivateToken.startsWith("shpat_")) return "legacy";
    return "private";
  }
  const token = shopifyPublicToken || legacyToken;
  if (token.startsWith("shpss_")) return "private";
  if (shopifyPublicToken && shopifyPublicToken !== legacyToken) return "public";
  if (legacyToken) return "legacy";
  return "none";
}

/** Server can call Storefront API (private or public/legacy token). */
export const shopifyServerConfigured =
  Boolean(shopifyStoreDomain) && getShopifyTokenMode() !== "none";

/**
 * Client knows Shopify cart is active (domain + flag or public token).
 * Set NEXT_PUBLIC_SHOPIFY_ENABLED=true when using only a private server token.
 */
export const shopifyClientEnabled =
  Boolean(shopifyStoreDomain) &&
  (process.env.NEXT_PUBLIC_SHOPIFY_ENABLED === "true" ||
    Boolean(
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN ||
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
    ));

/** @deprecated Use shopifyServerConfigured or shopifyClientEnabled */
export const shopifyConfigured = shopifyServerConfigured;

export { CATEGORY_COLLECTION_HANDLES } from "@/config/store-categories";
