import { shopifyPrivateToken, shopifyPublicToken } from "@/lib/shopify/config";

export type StorefrontAuthStrategy = {
  id: string;
  token: string;
  usePrivateHeader: boolean;
};

/**
 * Headless kanal: hex javni token → X-Shopify-Storefront-Access-Token.
 * shpss_ → Shopify-Storefront-Private-Token.
 * shpat_ u "private" polju često je Custom App Storefront token (javni header).
 */
export function getStorefrontAuthStrategies(): StorefrontAuthStrategy[] {
  const strategies: StorefrontAuthStrategy[] = [];
  const seen = new Set<string>();

  const add = (id: string, token: string, usePrivateHeader: boolean) => {
    const t = token.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    strategies.push({ id, token: t, usePrivateHeader });
  };

  if (shopifyPublicToken) {
    add("public-token", shopifyPublicToken, false);
  }

  if (shopifyPrivateToken.startsWith("shpss_")) {
    add("private-shpss", shopifyPrivateToken, true);
  } else if (shopifyPrivateToken.startsWith("shpat_")) {
    add("storefront-shpat", shopifyPrivateToken, false);
  } else if (shopifyPrivateToken) {
    add("private-raw", shopifyPrivateToken, true);
    add("private-as-public-header", shopifyPrivateToken, false);
  }

  return strategies;
}

export function buildAuthHeaders(
  strategy: StorefrontAuthStrategy,
  buyerIp?: string
): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (strategy.usePrivateHeader) {
    headers["Shopify-Storefront-Private-Token"] = strategy.token;
  } else {
    headers["X-Shopify-Storefront-Access-Token"] = strategy.token;
  }

  if (buyerIp) {
    headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  }

  return headers;
}
