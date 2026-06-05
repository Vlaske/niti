import {
  getStoreCategoryByCollectionHandle,
  isNavCategoryCollection,
} from "@/config/store-categories";
import {
  buildProductOptions,
  getVariantIdFromSelections,
  guessColorHex,
  isColorOptionName,
  mapVariantSnapshots,
} from "@/lib/shopify/variants";
import type { CartItem, Product, ProductColor } from "@/types";

type ShopifyMoney = { amount: string; currencyCode: string };

type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
};

export type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  options: { name: string; values: string[] }[];
  featuredImage?: { url: string; altText?: string | null } | null;
  images: { nodes: { url: string; altText?: string | null }[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
  };
  variants: { nodes: ShopifyVariant[] };
  collections: { nodes: { handle: string; title: string }[] };
};

function parseMoneyAmount(money?: ShopifyMoney | null): number {
  if (!money?.amount) return 0;
  return Math.round(parseFloat(money.amount));
}

function getColorFromVariantNode(v: ShopifyVariant): string | null {
  const colorOpt = v.selectedOptions.find((o) => isColorOptionName(o.name));
  return colorOpt?.value ?? null;
}

/** Samo kolekcije definisane u store-categories.ts; ostale = "all" (samo /shop). */
function resolveCategory(collections: { handle: string }[]): string {
  for (const col of collections) {
    const storeCat = getStoreCategoryByCollectionHandle(col.handle);
    if (storeCat) return storeCat.slug;
  }
  return "all";
}

/**
 * Jedna boja = jedan swatch (prva dostupna varijanta za tu boju).
 * Više dimenzija iste boje ne duplira "Siva Kocka".
 */
function buildColors(variants: ShopifyVariant[]): ProductColor[] | undefined {
  const withColor = variants
    .map((v) => ({ v, colorName: getColorFromVariantNode(v) }))
    .filter((x): x is { v: ShopifyVariant; colorName: string } =>
      Boolean(x.colorName)
    );

  if (withColor.length < 2) return undefined;

  const byColor = new Map<string, ProductColor>();

  for (const { v, colorName } of withColor) {
    const key = colorName.toLowerCase().trim();
    const existing = byColor.get(key);
    if (!existing) {
      byColor.set(key, {
        name: colorName,
        hex: guessColorHex(colorName),
        variantId: v.id,
      });
      continue;
    }
    if (v.availableForSale && existing.variantId) {
      byColor.set(key, {
        ...existing,
        variantId: v.id,
      });
    }
  }

  return Array.from(byColor.values());
}

function pickDefaultVariant(variants: ShopifyVariant[]): ShopifyVariant {
  return (
    variants.find((v) => v.availableForSale) ?? variants[0]
  );
}

export function mapShopifyProduct(node: ShopifyProductNode): Product {
  const variants = node.variants.nodes;
  const defaultVariant = pickDefaultVariant(variants);
  const minPrice = parseMoneyAmount(node.priceRange.minVariantPrice);
  const compareAt = node.compareAtPriceRange?.minVariantPrice
    ? parseMoneyAmount(node.compareAtPriceRange.minVariantPrice)
    : parseMoneyAmount(defaultVariant.compareAtPrice);

  const category = resolveCategory(node.collections.nodes);
  const navCollection = node.collections.nodes.find((c) =>
    isNavCategoryCollection(c.handle)
  );
  const collection =
    navCollection?.handle ?? node.collections.nodes[0]?.handle;

  const images = node.images.nodes.map((i) => i.url);
  const image = node.featuredImage?.url ?? images[0] ?? "";

  const isNew = node.tags.some((t) =>
    ["new", "novo", "new-arrival"].includes(t.toLowerCase())
  );
  const isSale =
    compareAt > 0 && compareAt > minPrice;

  const options = buildProductOptions(node.options ?? [], variants);
  const variantSnapshots = mapVariantSnapshots(variants);

  const plainDescription = node.description?.trim()
    ? node.description
    : stripHtml(node.descriptionHtml ?? "");

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    brand: node.vendor || "NITI.",
    description: plainDescription,
    descriptionHtml: node.descriptionHtml || undefined,
    price: minPrice,
    compareAtPrice: isSale ? compareAt : undefined,
    category,
    collection,
    image,
    images: images.length ? images : undefined,
    colors: buildColors(variants),
    options: options.length ? options : undefined,
    variants: variantSnapshots,
    variantId: defaultVariant.id,
    availableForSale: node.availableForSale && defaultVariant.availableForSale,
    tagline: plainDescription.slice(0, 160),
    isNew,
    isSale,
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export { getVariantIdFromSelections } from "@/lib/shopify/variants";

export function getVariantIdForColor(
  product: Product,
  colorName?: string
): string | undefined {
  if (!colorName) return product.variantId;
  const colorOpt = product.options?.find((o) => o.type === "color");
  if (colorOpt) {
    return getVariantIdFromSelections(product, {
      [colorOpt.name]: colorName,
    });
  }
  const match = product.colors?.find(
    (c) => c.name.toLowerCase() === colorName.toLowerCase()
  );
  return match?.variantId ?? product.variantId;
}

type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image?: { url: string } | null;
    price: ShopifyMoney;
    product: {
      id: string;
      handle: string;
      title: string;
      vendor: string;
      featuredImage?: { url: string } | null;
    };
    selectedOptions: { name: string; value: string }[];
  };
};

export type ShopifyCartPayload = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: { nodes: ShopifyCartLine[] };
};

export function mapCartLines(cart: ShopifyCartPayload): CartItem[] {
  return cart.lines.nodes.map((line) => {
    const m = line.merchandise;
    const colorOpt = m.selectedOptions.find(
      (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "boja"
    );

    const product: Product = {
      id: m.product.id,
      handle: m.product.handle,
      title: m.product.title,
      brand: m.product.vendor || "NITI.",
      description: "",
      price: parseMoneyAmount(m.price),
      category: "accessories",
      image: m.image?.url ?? m.product.featuredImage?.url ?? "",
      variantId: m.id,
    };

    return {
      product,
      quantity: line.quantity,
      selectedColor: colorOpt?.value,
      lineId: line.id,
    };
  });
}

export function parseCartSubtotal(cart: ShopifyCartPayload): number {
  return parseMoneyAmount(cart.cost.subtotalAmount);
}
