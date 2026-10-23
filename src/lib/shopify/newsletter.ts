/**
 * Newsletter signup through the Shopify Admin API.
 * Creates a customer with email marketing consent, or updates consent
 * when that email is already a customer.
 */

const API_VERSION = "2025-10";

type ConsentState = "SUBSCRIBED" | "PENDING";

type UserError = { field?: string[] | null; message: string };

function storeDomain(): string {
  return (
    process.env.SHOPIFY_STORE_DOMAIN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ??
    ""
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

function clientId(): string {
  return (process.env.SHOPIFY_CLIENT_ID ?? process.env.SHOPIFY_API_KEY ?? "").trim();
}

function clientSecret(): string {
  return (
    process.env.SHOPIFY_CLIENT_SECRET ??
    process.env.SHOPIFY_API_SECRET ??
    ""
  ).trim();
}

function legacyAdminToken(): string {
  const token = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "").trim();
  return token.startsWith("shpat_") ? token : "";
}

export function newsletterAdminConfigured(): boolean {
  if (!storeDomain()) return false;
  if (clientId() && clientSecret()) return true;
  return Boolean(legacyAdminToken());
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function adminToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const id = clientId();
  const secret = clientSecret();
  const domain = storeDomain();
  if (id && secret && domain) {
    const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: id,
        client_secret: secret,
      }),
    });
    if (!res.ok) {
      throw new Error(`Admin token HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!json.access_token) throw new Error("Admin token missing");
    cachedToken = json.access_token;
    tokenExpiresAt = Date.now() + (json.expires_in ?? 86399) * 1000;
    return json.access_token;
  }

  const legacy = legacyAdminToken();
  if (legacy) return legacy;
  throw new Error("Shopify Admin credentials are not configured");
}

async function adminGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const domain = storeDomain();
  const token = await adminToken();
  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length || !json.data) {
    const message = json.errors?.map((error) => error.message).join("; ");
    throw new Error(message || `Admin API HTTP ${res.status}`);
  }
  return json.data;
}

function consentInput(state: ConsentState) {
  return {
    marketingState: state,
    marketingOptInLevel: state === "PENDING" ? "CONFIRMED_OPT_IN" : "SINGLE_OPT_IN",
    consentUpdatedAt: new Date().toISOString(),
  };
}

function needsPending(errors: UserError[]): boolean {
  return errors.some((error) => /pending|confirm/i.test(error.message));
}

function alreadyCustomer(errors: UserError[]): boolean {
  return errors.some((error) => /already been taken|already exists/i.test(error.message));
}

const CREATE = `
  mutation newsletterCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const FIND = `
  query newsletterFind($query: String!) {
    customers(first: 1, query: $query) {
      nodes { id }
    }
  }
`;

const UPDATE = `
  mutation newsletterConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

async function createCustomer(
  email: string,
  state: ConsentState
): Promise<{ id?: string; userErrors: UserError[] }> {
  const data = await adminGraphql<{
    customerCreate: { customer: { id: string } | null; userErrors: UserError[] };
  }>(CREATE, {
    input: { email, emailMarketingConsent: consentInput(state) },
  });
  return {
    id: data.customerCreate.customer?.id,
    userErrors: data.customerCreate.userErrors ?? [],
  };
}

async function updateExisting(email: string, state: ConsentState): Promise<void> {
  const escaped = email.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const found = await adminGraphql<{
    customers: { nodes: { id: string }[] };
  }>(FIND, { query: `email:"${escaped}"` });
  const id = found.customers.nodes[0]?.id;
  if (!id) {
    throw new Error("Existing customer could not be loaded");
  }
  const updated = await adminGraphql<{
    customerEmailMarketingConsentUpdate: { userErrors: UserError[] };
  }>(UPDATE, {
    input: {
      customerId: id,
      emailMarketingConsent: consentInput(state),
    },
  });
  const errors = updated.customerEmailMarketingConsentUpdate.userErrors ?? [];
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join("; "));
  }
}

const SHOP_LIST = `
  query {
    shop {
      id
      newsletter: metafield(namespace: "niti", key: "newsletter_subscribers") {
        value
      }
    }
  }
`;

const SAVE_LIST = `
  mutation($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id }
      userErrors { field message }
    }
  }
`;

/** Private shop metafield. Visible in Shopify admin as “Newsletter prijave”. */
async function saveToShopList(email: string): Promise<void> {
  const shop = await adminGraphql<{
    shop: {
      id: string;
      newsletter: { value: string } | null;
    };
  }>(SHOP_LIST);

  let list: { email: string; at: string }[] = [];
  try {
    const parsed = JSON.parse(shop.shop.newsletter?.value || "[]") as unknown;
    if (Array.isArray(parsed)) {
      list = parsed.filter(
        (item): item is { email: string; at: string } =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as { email?: string }).email === "string"
      );
    }
  } catch {
    list = [];
  }

  if (!list.some((item) => item.email === email)) {
    list.push({ email, at: new Date().toISOString() });
  }

  const saved = await adminGraphql<{
    metafieldsSet: { userErrors: UserError[] };
  }>(SAVE_LIST, {
    metafields: [
      {
        ownerId: shop.shop.id,
        namespace: "niti",
        key: "newsletter_subscribers",
        type: "json",
        value: JSON.stringify(list),
      },
    ],
  });
  const errors = saved.metafieldsSet.userErrors ?? [];
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join("; "));
  }
}

export async function subscribeToNewsletter(email: string): Promise<void> {
  await saveToShopList(email);

  try {
    await subscribeCustomer(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/access denied|write_customers/i.test(message)) return;
    throw error;
  }
}

async function subscribeCustomer(email: string): Promise<void> {
  let created = await createCustomer(email, "SUBSCRIBED");
  if (needsPending(created.userErrors)) {
    created = await createCustomer(email, "PENDING");
  }
  if (created.id && created.userErrors.length === 0) return;

  if (alreadyCustomer(created.userErrors)) {
    try {
      await updateExisting(email, "SUBSCRIBED");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/pending|confirm/i.test(message)) {
        await updateExisting(email, "PENDING");
        return;
      }
      throw error;
    }
  }

  if (created.userErrors.length) {
    throw new Error(created.userErrors.map((error) => error.message).join("; "));
  }
}
