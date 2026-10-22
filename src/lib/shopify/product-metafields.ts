import type { ProductMetafield } from "@/types";

/** Storefront metafields on products. Namespace is `niti`, keys match Shopify definitions. */
export const PRODUCT_METAFIELD_DEFS = [
  { namespace: "niti", key: "sastav" },
  { namespace: "niti", key: "dimenzija" },
  { namespace: "niti", key: "velicina" },
  { namespace: "niti", key: "boja" },
  { namespace: "niti", key: "tezina" },
  { namespace: "niti", key: "dimenzija_pakovanja" },
  { namespace: "niti", key: "pranje" },
  { namespace: "niti", key: "peglanje" },
  { namespace: "niti", key: "skupljanje" },
  { namespace: "niti", key: "prava_potrosaca" },
] as const;

export type ShopifyMetafieldNode = {
  namespace: string;
  key: string;
  value: string;
  type?: string | null;
};

export function productMetafieldsSelection(): string {
  const identifiers = PRODUCT_METAFIELD_DEFS.map(
    (def) => `{namespace: "${def.namespace}", key: "${def.key}"}`
  ).join(", ");
  return `metafields(identifiers: [${identifiers}]) { namespace key value type }`;
}

function formatMetafieldValue(value: string, type?: string | null): string {
  const trimmed = value.trim();
  if (!type?.startsWith("list.")) return trimmed;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item === "string" && item.trim())
        .join(", ");
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

export function mapProductMetafields(
  nodes: (ShopifyMetafieldNode | null)[] | null | undefined
): ProductMetafield[] {
  const byKey = new Map<string, ProductMetafield>();
  for (const node of nodes ?? []) {
    if (!node?.value?.trim()) continue;
    const value = formatMetafieldValue(node.value, node.type);
    if (!value) continue;
    byKey.set(node.key, {
      namespace: node.namespace,
      key: node.key,
      value,
    });
  }

  return PRODUCT_METAFIELD_DEFS.flatMap((def) => {
    const field = byKey.get(def.key);
    return field ? [field] : [];
  });
}
