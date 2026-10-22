import type {
  Product,
  ProductOption,
  ProductOptionValue,
  ProductVariantSnapshot,
} from "@/types";
import type { ShopifyOptionValueNode } from "@/lib/shopify/color-images";

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
  blue: "#6f86a3",
  green: "#7d9a78",
  pink: "#e8d4d0",
  beige: "#d4c4b0",
  ivory: "#f3eee4",
  navy: "#2c3a4f",
  black: "#2b2a28",
  red: "#9a3f3c",
  gold: "#c4a574",
  silver: "#c5c1ba",
  brown: "#6b5344",
  yellow: "#d8c56a",
  orange: "#d0894f",
  purple: "#7a6b8a",
  mint: "#c5d8cf",
  teal: "#5f8a86",
  taupe: "#b5a89a",
  charcoal: "#3a3836",
  anthracite: "#3a3836",
  siva: "#9a9590",
  sivo: "#9a9590",
  sivi: "#9a9590",
  crna: "#2b2a28",
  crno: "#2b2a28",
  crni: "#2b2a28",
  bela: "#f5f3ef",
  belo: "#f5f3ef",
  beli: "#f5f3ef",
  bez: "#d4c4b0",
  krem: "#ebe4d8",
  plava: "#6f86a3",
  plavo: "#6f86a3",
  plavi: "#6f86a3",
  teget: "#2c3a4f",
  zelena: "#7d9a78",
  zeleno: "#7d9a78",
  maslin: "#8a8f62",
  roze: "#e8d4d0",
  ruzicasta: "#e8d4d0",
  ljubicasta: "#7a6b8a",
  lila: "#b7a7c4",
  braon: "#6b5344",
  smedja: "#6b5344",
  bordo: "#6e2e32",
  crvena: "#9a3f3c",
  zuta: "#d8c56a",
  narandzasta: "#d0894f",
  tirkiz: "#5f8a86",
  lavanda: "#b7a7c4",
  kapucino: "#8a6f5a",
  cokolada: "#5c4033",
  slonovaca: "#f3eee4",
  antracit: "#3a3836",
  grafit: "#5a5855",
  zlatna: "#c4a574",
  srebrna: "#c5c1ba",
  terra: "#c47a5a",
  oker: "#c4a05a",
  visnja: "#6e2e32",
  kajsija: "#e0b07a",
  ciklama: "#c45b7a",
  vino: "#6e2e32",
  rezedo: "#7d9a78",
  prljavobela: "#ebe6dc",
};

function normalizeColorKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "");
}

export type ColorSwatchStyle = {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
};

export function guessColorHex(value: string): string {
  const key = normalizeColorKey(value);
  const entries = Object.entries(COLOR_HEX).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [name, hex] of entries) {
    if (key.includes(name)) return hex;
  }
  return "#d4cfc8";
}

export function guessColorSwatchStyle(value: string): ColorSwatchStyle {
  const key = normalizeColorKey(value);
  const hex = guessColorHex(value);

  // “Dezen” / patterned — multi-tone textile cue (not a flat color)
  if (
    key === "dezen" ||
    /^dezeniran|dezenirana|dezenirani/.test(key) ||
    /dezen|pattern|print|multi/.test(key)
  ) {
    return {
      backgroundImage:
        "conic-gradient(from 200deg at 50% 50%, #c9b8a0 0deg, #b8c4b0 72deg, #d4b8b4 144deg, #8fa3b8 216deg, #c9b8a0 288deg, #c9b8a0 360deg)",
    };
  }
  if (/kock|karo|check|pepit|gigham/.test(key)) {
    return {
      backgroundImage: `repeating-conic-gradient(${hex} 0% 25%, #f5f3ef 0% 50%)`,
      backgroundSize: "10px 10px",
    };
  }
  if (/prug|stripe|linij/.test(key)) {
    return {
      backgroundImage: `repeating-linear-gradient(135deg, ${hex} 0 4px, #f5f3ef 4px 8px)`,
    };
  }
  if (/cvet|floral|tock/.test(key)) {
    return {
      backgroundImage: `radial-gradient(circle at 30% 30%, ${hex} 0 28%, #f5f3ef 30% 100%)`,
    };
  }
  return { backgroundColor: hex };
}

export function isPatternOptionName(name: string): boolean {
  const n = name.toLowerCase().trim();
  return n === "dezen" || n === "pattern" || n === "print" || n === "dezenir";
}

export function isColorOptionName(name: string): boolean {
  return COLOR_OPTION_NAMES.has(name.toLowerCase().trim());
}

export function isSizeOptionName(name: string): boolean {
  return SIZE_OPTION_NAMES.has(name.toLowerCase().trim());
}

/** True when a variant matches every currently selected option. */
export function variantMatchesSelections(
  selectedOptions: { name: string; value: string }[],
  selections: Record<string, string>,
  exceptOption?: string
): boolean {
  return Object.entries(selections).every(([name, value]) => {
    if (exceptOption && name === exceptOption) return true;
    if (!value) return true;
    return selectedOptions.some((o) => o.name === name && o.value === value);
  });
}

/**
 * Whether an option value is available given the other selections
 * (e.g. after picking Boja=Bordo, only sizes that exist for Bordo).
 */
export function isOptionValueAvailableForSelections(
  variants: ProductVariantSnapshot[],
  optionName: string,
  value: string,
  selections: Record<string, string>
): boolean {
  return variants.some(
    (v) =>
      v.availableForSale &&
      v.selectedOptions.some(
        (so) => so.name === optionName && so.value === value
      ) &&
      variantMatchesSelections(v.selectedOptions, selections, optionName)
  );
}

type ShopifyOption = {
  name: string;
  values: string[];
  optionValues?: ShopifyOptionValueNode[];
};
type ShopifyVariant = {
  id: string;
  availableForSale: boolean;
  price: { amount: string };
  compareAtPrice?: { amount: string } | null;
  selectedOptions: { name: string; value: string }[];
  image?: { url: string; altText?: string | null } | null;
  sku?: string | null;
  barcode?: string | null;
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
    image: v.image?.url || undefined,
    sku: v.sku?.trim() || undefined,
    barcode: v.barcode?.trim() || undefined,
  }));
}

type MediaNode = { url: string; altText?: string | null };

export function buildProductOptions(
  shopifyOptions: ShopifyOption[],
  variants: ShopifyVariant[],
  media: MediaNode[] = [],
  _colorImages: Record<string, string> = {}
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
        : isPatternOptionName(opt.name)
          ? "color"
          : "other";

    const valueEntries: ShopifyOptionValueNode[] =
      (opt.optionValues?.length ?? 0) > 0
        ? opt.optionValues!
        : opt.values.map((name) => ({ name }));

    const values: ProductOptionValue[] = valueEntries.map((entry) => {
      const value = entry.name;
      const swatchColor = entry.swatch?.color?.trim();
      return {
        value,
        hex:
          type === "color"
            ? swatchColor || guessColorHex(value)
            : undefined,
        // TEMP: product photos on color dots are unreliable until Shopify
        // variant ↔ image links are set. Re-enable later with _colorImages:
        // image:
        //   type === "color"
        //     ? _colorImages[value] ||
        //       entry.swatch?.image?.image?.url?.trim() ||
        //       undefined
        //     : undefined,
        image: undefined,
        available: variants.some(
          (v) =>
            v.availableForSale &&
            v.selectedOptions.some(
              (so) => so.name === opt.name && so.value === value
            )
        ),
      };
    });

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
