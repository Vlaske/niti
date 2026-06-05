import {
  buildAuthHeaders,
  getStorefrontAuthStrategies,
  type StorefrontAuthStrategy,
} from "@/lib/shopify/auth";
import {
  getShopifyTokenMode,
  SHOPIFY_API_VERSION,
  shopifyConfigured,
  shopifyStoreDomain,
} from "@/lib/shopify/config";

export { shopifyConfigured, getShopifyTokenMode };

type ShopifyFetchOptions = {
  buyerIp?: string;
  revalidate?: number | false;
};

type ShopifyGraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

/** Zapamti strategiju koja je poslednja uspela (po procesu). */
let cachedAuthStrategy: StorefrontAuthStrategy | null = null;

function getEndpoint() {
  const domain = shopifyStoreDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

function getStrategiesToTry(): StorefrontAuthStrategy[] {
  const all = getStorefrontAuthStrategies();
  if (!all.length) return [];

  if (cachedAuthStrategy) {
    const rest = all.filter((s) => s.id !== cachedAuthStrategy!.id);
    return [cachedAuthStrategy, ...rest];
  }
  return all;
}

async function requestWithStrategy<T>(
  strategy: StorefrontAuthStrategy,
  query: string,
  variables: Record<string, unknown> | undefined,
  options: ShopifyFetchOptions
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const { buyerIp, revalidate = 60 } = options;

  const res = await fetch(getEndpoint(), {
    method: "POST",
    headers: buildAuthHeaders(strategy, buyerIp),
    body: JSON.stringify({ query, variables }),
    ...(revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  const json = (await res.json()) as ShopifyGraphqlResponse<T>;

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: json.errors?.[0]?.message ?? res.statusText ?? `HTTP ${res.status}`,
    };
  }

  if (json.errors?.length) {
    return { ok: false, status: 200, message: json.errors[0].message };
  }

  if (!json.data) {
    return { ok: false, status: 200, message: "Shopify API: prazan odgovor" };
  }

  return { ok: true, data: json.data };
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

  const strategies = getStrategiesToTry();
  if (!strategies.length) {
    throw new Error(
      "Nema Storefront tokena. Dodaj SHOPIFY_STOREFRONT_PUBLIC_TOKEN ili SHOPIFY_STOREFRONT_PRIVATE_TOKEN."
    );
  }

  const errors: string[] = [];

  for (const strategy of strategies) {
    const result = await requestWithStrategy<T>(
      strategy,
      query,
      variables,
      options
    );

    if (result.ok) {
      cachedAuthStrategy = strategy;
      return result.data;
    }

    errors.push(`${strategy.id}: ${result.message}`);

    if (result.status !== 401 && result.status !== 403) {
      break;
    }
  }

  throw new Error(
    `Shopify autentifikacija nije uspela. ${errors.join(" | ")}`
  );
}

export function getActiveAuthStrategyId(): string | null {
  return cachedAuthStrategy?.id ?? null;
}

/** Reset keša (npr. posle promene .env u dev-u). */
export function resetShopifyAuthCache() {
  cachedAuthStrategy = null;
}
