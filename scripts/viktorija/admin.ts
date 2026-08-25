import { loadLocalEnv } from "./load-env";

loadLocalEnv();

const API_VERSION = "2025-10";

export function getStoreDomain(): string {
  return (
    process.env.SHOPIFY_STORE_DOMAIN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ??
    ""
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

function getClientId(): string {
  return (
    process.env.SHOPIFY_CLIENT_ID ??
    process.env.SHOPIFY_API_KEY ??
    ""
  ).trim();
}

function getClientSecret(): string {
  return (
    process.env.SHOPIFY_CLIENT_SECRET ??
    process.env.SHOPIFY_API_SECRET ??
    ""
  ).trim();
}

/** Legacy static Admin token (older custom apps). */
function getLegacyAdminToken(): string {
  const t = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "").trim();
  if (t.startsWith("shpat_")) return t;
  return "";
}

export function adminConfigured(): boolean {
  if (!getStoreDomain()) return false;
  if (getClientId() && getClientSecret()) return true;
  return Boolean(getLegacyAdminToken());
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function exchangeClientCredentials(): Promise<string> {
  const domain = getStoreDomain();
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  if (!domain || !clientId || !clientSecret) {
    throw new Error("Missing SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET");
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Token request failed HTTP ${res.status}: ${text.slice(0, 240)}`
    );
  }

  const json = JSON.parse(text) as {
    access_token?: string;
    expires_in?: number;
    scope?: string;
  };
  if (!json.access_token) {
    throw new Error("Token response had no access_token");
  }

  const ttlMs = (json.expires_in ?? 86399) * 1000;
  cachedToken = json.access_token;
  tokenExpiresAt = Date.now() + ttlMs;
  if (json.scope) {
    console.log(`Admin token scopes: ${json.scope}`);
  }
  return json.access_token;
}

export async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  if (getClientId() && getClientSecret()) {
    return exchangeClientCredentials();
  }

  const legacy = getLegacyAdminToken();
  if (legacy) return legacy;

  throw new Error(
    "Missing Shopify Admin credentials. In .env.local set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET (Dev Dashboard → App settings → Client ID / Secret). Do not paste the secret into chat."
  );
}

type GqlError = { message: string };

export async function adminGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const domain = getStoreDomain();
  if (!domain) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN in .env.local");
  }
  const token = await getAdminToken();

  const res = await fetch(
    `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = (await res.json()) as {
    data?: T;
    errors?: GqlError[];
  };

  if (!res.ok) {
    throw new Error(`Admin API HTTP ${res.status}`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new Error("Admin API returned no data");
  return json.data;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
