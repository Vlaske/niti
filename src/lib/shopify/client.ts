import {
  getShopifyTokenMode,
  SHOPIFY_API_VERSION,
  shopifyConfigured,
  shopifyPrivateToken,
  shopifyPublicToken,
  shopifyStoreDomain,
} from "@/lib/shopify/config";

export { shopifyConfigured, getShopifyTokenMode };

type ShopifyFetchOptions = {
  /** Buyer IP for rate limits / bot protection on buyer-driven requests */
  buyerIp?: string;
  revalidate?: number | false;
};

function getEndpoint() {
  const domain = shopifyStoreDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

function getActiveToken(): string {
  return shopifyPrivateToken || shopifyPublicToken;
}

/**
 * Private header: Headless shpss_ tokens.
 * shpat_ Storefront tokens from Custom App use X-Shopify-Storefront-Access-Token.
 */
function usePrivateTokenHeader(): boolean {
  const token = getActiveToken();
  if (token.startsWith("shpat_")) return false;
  if (shopifyPrivateToken && shopifyPrivateToken.startsWith("shpss_")) return true;
  return token.startsWith("shpss_");
}

function buildHeaders(buyerIp?: string): HeadersInit {
  const token = getActiveToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (usePrivateTokenHeader()) {
    headers["Shopify-Storefront-Private-Token"] = token;
  } else {
    headers["X-Shopify-Storefront-Access-Token"] = token;
  }

  if (buyerIp) {
    headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  }

  return headers;
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: ShopifyFetchOptions = {}
): Promise<T> {
  if (!shopifyConfigured) {
    throw new Error(
      "Shopify nije konfigurisan. Dodaj SHOPIFY_STORE_DOMAIN i token u .env.local (vidi SHOPIFY_SETUP.md)."
    );
  }

  const { buyerIp, revalidate = 60 } = options;

  const res = await fetch(getEndpoint(), {
    method: "POST",
    headers: buildHeaders(buyerIp),
    body: JSON.stringify({ query, variables }),
    ...(revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (!res.ok) {
    throw new Error(
      `Shopify HTTP ${res.status}: ${json.errors?.[0]?.message ?? res.statusText}`
    );
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("Shopify API: prazan odgovor");
  }

  return json.data;
}
