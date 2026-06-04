import { CATEGORY_COLLECTION_HANDLES } from "@/lib/shopify/config";
import type { CartItem, Product, ProductColor } from "@/types";

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
};

const KNOWN_CATEGORIES = new Set(Object.keys(CATEGORY_COLLECTION_HANDLES));

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
  vendor: string;
  tags: string[];
  availableForSale: boolean;
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

function guessHex(optionValue: string): string {
  const key = optionValue.toLowerCase().replace(/\s+/g, "");
  for (const [name, hex] of Object.entries(COLOR_HEX)) {
    if (key.includes(name)) return hex;
  }
  return "#d4cfc8";
}

function resolveCategory(collections: { handle: string }[]): string {
  for (const col of collections) {
    const mapped = Object.entries(CATEGORY_COLLECTION_HANDLES).find(
      ([, handle]) => handle === col.handle
    );
    if (mapped) return mapped[0];
    if (KNOWN_CATEGORIES.has(col.handle)) return col.handle;
  }
  return collections[0]?.handle ?? "accessories";
}

function buildColors(variants: ShopifyVariant[]): ProductColor[] | undefined {
  const colorVariants = variants.filter((v) =>
    v.selectedOptions.some(
      (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "boja"
    )
  );

  if (colorVariants.length < 2) return undefined;

  return colorVariants.map((v) => {
    const colorOpt = v.selectedOptions.find(
      (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "boja"
    );
    const name = colorOpt?.value ?? v.title;
    return {
      name,
      hex: guessHex(name),
      variantId: v.id,
    };
  });
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
  const collection = node.collections.nodes.find((c) => c.handle === "linen")
    ? "linen"
    : node.collections.nodes[0]?.handle;

  const images = node.images.nodes.map((i) => i.url);
  const image = node.featuredImage?.url ?? images[0] ?? "";

  const isNew = node.tags.some((t) =>
    ["new", "novo", "new-arrival"].includes(t.toLowerCase())
  );
  const isSale =
    compareAt > 0 && compareAt > minPrice;

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    brand: node.vendor || "NITI.",
    description: node.description,
    price: minPrice,
    compareAtPrice: isSale ? compareAt : undefined,
    category,
    collection,
    image,
    images: images.length ? images : undefined,
    colors: buildColors(variants),
    variantId: defaultVariant.id,
    availableForSale: node.availableForSale && defaultVariant.availableForSale,
    tagline: node.description.slice(0, 160),
    isNew,
    isSale,
  };
}

export function getVariantIdForColor(
  product: Product,
  colorName?: string
): string | undefined {
  if (!colorName) return product.variantId;
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
