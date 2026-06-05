import type {
  Product,
  ProductOption,
  ProductOptionValue,
  ProductVariantSnapshot,
} from "@/types";

const COLOR_OPTION_NAMES = new Set([
  "color",
  "colour",
  "boja",
  "farba",
  "couleur",
]);

const SIZE_OPTION_NAMES = new Set([
  "size",
  "veličina",
  "velicina",
  "dimension",
  "dimenzija",
  "dimenzije",
]);

const COLOR_HEX: Record<string, string> = {
  white: "#f5f3ef",
  cream: "#ebe4d8",
  sage: "#b8c4b0",
  blush: "#e8d4d0",
  sand: "#d4c4b0",
  grey: "#9a9590",
  gray: "#9a9590",
  blue: "#a8b8c8",
  green: "#b8c4b0",
  pink: "#e8d4d0",
  beige: "#d4c4b0",
  siva: "#9a9590",
  crna: "#3a3836",
  bela: "#f5f3ef",
};

export function isColorOptionName(name: string): boolean {
  return COLOR_OPTION_NAMES.has(name.toLowerCase().trim());
}

export function isSizeOptionName(name: string): boolean {
  return SIZE_OPTION_NAMES.has(name.toLowerCase().trim());
}

export function guessColorHex(value: string): string {
  const key = value.toLowerCase().replace(/\s+/g, "");
  for (const [name, hex] of Object.entries(COLOR_HEX)) {
    if (key.includes(name)) return hex;
  }
  return "#d4cfc8";
}

type ShopifyOption = { name: string; values: string[] };
type ShopifyVariant = {
  id: string;
  availableForSale: boolean;
  price: { amount: string };
  compareAtPrice?: { amount: string } | null;
  selectedOptions: { name: string; value: string }[];
};

export function mapVariantSnapshots(
  variants: ShopifyVariant[]
): ProductVariantSnapshot[] {
  return variants.map((v) => ({
    id: v.id,
    availableForSale: v.availableForSale,
    price: Math.round(parseFloat(v.price.amount)),
    compareAtPrice: v.compareAtPrice
      ? Math.round(parseFloat(v.compareAtPrice.amount))
      : undefined,
    selectedOptions: v.selectedOptions,
  }));
}

export function buildProductOptions(
  shopifyOptions: ShopifyOption[],
  variants: ShopifyVariant[]
): ProductOption[] {
  const meaningful = shopifyOptions.filter(
    (o) =>
      o.values.length > 0 &&
      !(o.values.length === 1 && o.values[0] === "Default Title")
  );

  if (meaningful.length === 0) return [];

  return meaningful.map((opt) => {
    const type: ProductOption["type"] = isColorOptionName(opt.name)
      ? "color"
      : isSizeOptionName(opt.name)
        ? "size"
        : "other";

    const values: ProductOptionValue[] = opt.values.map((value) => ({
      value,
      hex: type === "color" ? guessColorHex(value) : undefined,
      available: variants.some(
        (v) =>
          v.availableForSale &&
          v.selectedOptions.some(
            (so) => so.name === opt.name && so.value === value
          )
      ),
    }));

    return {
      name: opt.name,
      label: opt.name,
      type,
      values,
    };
  });
}

export function findVariantBySelections(
  product: Product,
  selections: Record<string, string>
): ProductVariantSnapshot | undefined {
  if (!product.variants?.length) return undefined;

  return product.variants.find((v) =>
    Object.entries(selections).every(([name, value]) =>
      v.selectedOptions.some((o) => o.name === name && o.value === value)
    )
  );
}

export function productRequiresOptionSelection(product: Product): boolean {
  return (product.options?.length ?? 0) > 0;
}

export function getVariantIdFromSelections(
  product: Product,
  selections: Record<string, string>
): string | undefined {
  return findVariantBySelections(product, selections)?.id ?? product.variantId;
}
