import { productImageSrc } from "@/lib/product-image";
import {
  buildColorImageMap,
  findColorOptionName,
  normalizeImageUrl,
  type ShopifyOptionValueNode,
} from "@/lib/shopify/color-images";
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
  image?: { id?: string; url: string; altText?: string | null } | null;
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
  options: {
    name: string;
    values: string[];
    optionValues?: ShopifyOptionValueNode[];
  }[];
  featuredImage?: { id?: string; url: string; altText?: string | null } | null;
  images: { nodes: { url: string; altText?: string | null }[] };
  media?: {
    nodes: {
      alt?: string | null;
      mediaContentType?: string;
      image?: { url: string; altText?: string | null } | null;
    }[];
  };
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

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function looksLikeKidsTitle(title: string): boolean {
  const n = normalizeToken(title);
  if (/kuhinjsk|kecelj|stolnjak|\bkrpa\b|krpe/.test(n)) return false;
  return (
    /decij|bebi|bebe|krevetac|junior|\bkids\b/.test(n) ||
    /unicorn|mermaid|princess|balerina|sloncic|street-king|rock-n-roll/.test(
      n
    ) ||
    /cotton-life.*(unicorn|lola|freezone)/.test(n)
  );
}

/** Adult blankets/throws that must never land in Dečiji program */
function looksLikeAdultBlanket(title: string): boolean {
  const n = normalizeToken(title);
  if (looksLikeKidsTitle(title)) return false;
  return (
    /cebe-prekrivac/.test(n) ||
    /^(cebe|cebad|prekrivac|jorgan|step-deka|frotirni)/.test(n)
  );
}

function looksLikeDecorative(text: string): boolean {
  const n = normalizeToken(text);
  return (
    /ukrasn/.test(n) ||
    /dekorativn/.test(n) ||
    /ukrasne-jastucnice|prekrivaci-tdf|dekorativni-tekstil/.test(n)
  );
}

function looksLikeHotel(text: string): boolean {
  const n = normalizeToken(text);
  return /hotel|ugostitelj/.test(n);
}

function isKidsCollectionHandle(handle: string): boolean {
  const n = normalizeToken(handle);
  return /decij/.test(n);
}

function resolveKidsLeaf(
  title: string,
  collections: { handle: string }[]
): string {
  for (const c of collections) {
    const h = normalizeToken(c.handle);
    if (!isKidsCollectionHandle(h)) continue;
    if (/postelj/.test(h)) return "decija-posteljina";
    if (/cebad|cebe/.test(h)) return "decija-cebad";
    if (/jastuk|jastuc/.test(h)) return "deciji-jastuci-i-jastucnice";
    if (/peskir/.test(h)) return "deciji-peskiri";
  }

  const n = normalizeToken(title);
  if (/(decij|bebi|bebe).*peskir|peskir.*(decij|bebi|bebe)/.test(n)) {
    return "deciji-peskiri";
  }
  if (
    /(decij|bebi|bebe)/.test(n) &&
    (/cebe|cebad|prekrivac/.test(n) || /cebe-prekrivac/.test(n))
  ) {
    return "decija-cebad";
  }
  if (
    /(jastuk|jastucnic|sloncic)/.test(n) &&
    /(decij|bebi|bebe|sloncic)/.test(n) &&
    !/posteljin|set/.test(n)
  ) {
    return "deciji-jastuci-i-jastucnice";
  }
  return "decija-posteljina";
}

function resolveAdultBlanketLeaf(title: string): string {
  const n = normalizeToken(title);
  if (/jorgan|step|frotirni-prekriv/.test(n)) return "jorgani-i-prekrivaci";
  if (/prekrivac/.test(n) && !/cebe/.test(n)) return "jorgani-i-prekrivaci";
  return "cebad";
}

function looksLikePillow(title: string): boolean {
  const n = normalizeToken(title);
  return /jastuk/.test(n) && !/jastucnic/.test(n);
}

function looksLikePillowcase(title: string): boolean {
  const n = normalizeToken(title);
  return /jastucnic/.test(n);
}

function pillowLeavesFromTitle(title: string): string[] {
  const isCase = looksLikePillowcase(title);
  const isPillow = looksLikePillow(title);
  if (isCase && isPillow) return ["jastuci", "jastucnice"];
  if (isCase) return ["jastucnice"];
  if (isPillow) return ["jastuci"];
  return ["jastuci", "jastucnice"];
}

function expandCombinedSlug(slug: string, title: string): string[] {
  if (slug === "jastuci-i-jastucnice") return pillowLeavesFromTitle(title);
  return [slug];
}

function resolveFromTitle(title: string): string | null {
  const n = normalizeToken(title);
  if (/ukrasn/.test(n)) return "dekorativni-tekstil";
  if (/stolnjak/.test(n)) return "stolnjaci";
  if (/kecelj/.test(n)) return "kecelje";
  if (/kuhinjsk.*krp|krpa|krpe/.test(n) && !/peskir/.test(n)) {
    return "kuhinjske-krpe";
  }
  if (/bade.?mantil|mantil/.test(n)) return "bade-mantili";
  if (/prostir|rukavic/.test(n)) return "prostirke";
  if (/peskir/.test(n)) return "peskiri";
  if (/naddusec|nad.?dusec/.test(n)) return "nadduseci";
  if (/carsav/.test(n)) return "carsavi";
  if (/posteljin|set.*post/.test(n)) return "posteljine";
  if (/jorgan|step-deka|frotirni-prekriv/.test(n)) return "jorgani-i-prekrivaci";
  if (/prekrivac/.test(n) && !/ukrasn|decij/.test(n)) {
    return "jorgani-i-prekrivaci";
  }
  if (/cebe|cebad/.test(n) && !/decij/.test(n)) return "cebad";
  if (looksLikePillowcase(title) && !looksLikeKidsTitle(title)) {
    return "jastucnice";
  }
  if (looksLikePillow(title) && !looksLikeKidsTitle(title)) {
    return "jastuci";
  }
  return null;
}

function addLeaf(
  into: Set<string>,
  slug: string | null | undefined,
  title: string
) {
  if (!slug || slug === "all") return;
  for (const part of expandCombinedSlug(slug, title)) into.add(part);
}

/** All overlapping leaves + a primary for breadcrumbs. */
function resolveCategories(node: ShopifyProductNode): {
  primary: string;
  all: string[];
} {
  const collections = node.collections?.nodes ?? [];
  const tags = node.tags ?? [];
  const title = node.title ?? "";
  const blob = [
    title,
    ...tags,
    ...collections.map((c) => `${c.handle} ${c.title}`),
  ].join(" ");
  const handleBlob = collections.map((c) => normalizeToken(c.handle)).join(" ");
  const found = new Set<string>();

  for (const tag of tags) {
    const niti = tag.match(/^niti:(.+)$/i);
    if (niti?.[1]) {
      addLeaf(found, getStoreCategoryByCollectionHandle(niti[1])?.slug, title);
    }
    addLeaf(
      found,
      getStoreCategoryByCollectionHandle(normalizeToken(tag))?.slug,
      title
    );
  }

  for (const col of collections) {
    addLeaf(
      found,
      getStoreCategoryByCollectionHandle(col.handle)?.slug,
      title
    );
  }

  addLeaf(found, resolveFromTitle(title), title);

  const isHotel =
    looksLikeHotel(blob) ||
    collections.some((c) => normalizeToken(c.handle).includes("hotel"));
  if (isHotel) found.add("hotelski-program");

  const isKids =
    looksLikeKidsTitle(title) ||
    collections.some((c) => isKidsCollectionHandle(c.handle));
  if (isKids) found.add(resolveKidsLeaf(title, collections));

  if (
    looksLikeDecorative(blob) ||
    /ukrasne-jastucnice|prekrivaci-tdf|dekorativni/.test(handleBlob)
  ) {
    found.add("dekorativni-tekstil");
    if (looksLikePillowcase(title) || looksLikePillow(title)) {
      pillowLeavesFromTitle(title).forEach((s) => found.add(s));
    }
  }

  if (looksLikeAdultBlanket(title)) {
    found.delete("decija-cebad");
    found.delete("decija-posteljina");
    found.delete("deciji-jastuci-i-jastucnice");
    found.delete("deciji-peskiri");
    found.add(resolveAdultBlanketLeaf(title));
  }

  const all = [...found];
  const primary = resolvePrimaryCategory(node, all);
  if (primary !== "all" && !all.includes(primary)) all.unshift(primary);
  return { primary, all: all.length ? all : [primary] };
}

function resolvePrimaryCategory(
  node: ShopifyProductNode,
  all: string[]
): string {
  const collections = node.collections?.nodes ?? [];
  const tags = node.tags ?? [];
  const title = node.title ?? "";
  const blob = [
    title,
    ...tags,
    ...collections.map((c) => `${c.handle} ${c.title}`),
  ].join(" ");
  const handleBlob = collections.map((c) => normalizeToken(c.handle)).join(" ");

  const pick = (slug: string) => (all.includes(slug) ? slug : null);

  if (looksLikeAdultBlanket(title)) {
    return resolveAdultBlanketLeaf(title);
  }

  const kidsByTitle = looksLikeKidsTitle(title);
  const kidsByCollection = collections.some((c) =>
    isKidsCollectionHandle(c.handle)
  );
  if (kidsByTitle || kidsByCollection) {
    return resolveKidsLeaf(title, collections);
  }

  if (
    looksLikeDecorative(blob) ||
    /ukrasne-jastucnice|prekrivaci-tdf|dekorativni/.test(handleBlob)
  ) {
    return pick("dekorativni-tekstil") ?? "dekorativni-tekstil";
  }

  if (
    looksLikeHotel(blob) ||
    collections.some((c) => normalizeToken(c.handle).includes("hotel"))
  ) {
    return "hotelski-program";
  }

  for (const tag of tags) {
    const niti = tag.match(/^niti:(.+)$/i);
    if (niti?.[1]) {
      const storeCat = getStoreCategoryByCollectionHandle(niti[1]);
      if (storeCat) {
        const [first] = expandCombinedSlug(storeCat.slug, title);
        if (first) return first;
      }
    }
  }

  for (const col of collections) {
    const storeCat = getStoreCategoryByCollectionHandle(col.handle);
    if (storeCat) {
      const [first] = expandCombinedSlug(storeCat.slug, title);
      if (first) return first;
    }
  }

  return resolveFromTitle(title) ?? all[0] ?? "all";
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
        image: v.image?.url || undefined,
      });
      continue;
    }
    if (v.availableForSale && existing.variantId) {
      byColor.set(key, {
        ...existing,
        variantId: v.id,
        image: v.image?.url || existing.image,
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

  const { primary: category, all: categorySlugs } = resolveCategories(node);
  const navCollection = node.collections.nodes.find((c) =>
    isNavCategoryCollection(c.handle)
  );
  const collection =
    navCollection?.handle ?? node.collections.nodes[0]?.handle;

  const images = node.images.nodes
    .map((i) => i.url)
    .filter((url) => Boolean(url?.trim()));

  const mediaMap = new Map<string, { url: string; altText?: string }>();
  for (const i of node.images.nodes) {
    if (!i.url?.trim()) continue;
    mediaMap.set(normalizeImageUrl(i.url), {
      url: i.url,
      altText: i.altText ?? undefined,
    });
  }
  for (const m of node.media?.nodes ?? []) {
    const url = m.image?.url?.trim();
    if (!url) continue;
    const key = normalizeImageUrl(url);
    const existing = mediaMap.get(key);
    mediaMap.set(key, {
      url,
      altText: m.alt ?? m.image?.altText ?? existing?.altText,
    });
  }
  const media = [...mediaMap.values()];

  const image = productImageSrc(node.featuredImage?.url ?? images[0]);

  const isNew = node.tags.some((t) =>
    ["new", "novo", "new-arrival"].includes(t.toLowerCase())
  );
  const isSale =
    compareAt > 0 && compareAt > minPrice;

  const colorOptionName = findColorOptionName(node.options ?? []);
  const colorOpt = node.options?.find((o) => o.name === colorOptionName);
  const colorValues =
    colorOpt?.optionValues?.map((o) => o.name) ?? colorOpt?.values ?? [];
  const featuredRef = node.featuredImage?.url
    ? {
        id: node.featuredImage.id,
        url: node.featuredImage.url,
        altText: node.featuredImage.altText ?? undefined,
      }
    : undefined;

  const colorImages =
    colorOptionName && colorValues.length
      ? buildColorImageMap(colorValues, variants, media, colorOptionName, {
          featured: featuredRef,
          optionValues: colorOpt?.optionValues,
        })
      : undefined;

  const options = buildProductOptions(
    node.options ?? [],
    variants,
    media,
    colorImages ?? {}
  );
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
    categories: categorySlugs,
    collection,
    image,
    images: images.length ? images : undefined,
    media: media.length ? media : undefined,
    colorImages: colorImages && Object.keys(colorImages).length
      ? colorImages
      : undefined,
    colors: buildColors(variants),
    options: options.length ? options : undefined,
    variants: variantSnapshots,
    variantId: defaultVariant.id,
    availableForSale: node.availableForSale && defaultVariant.availableForSale,
    tagline: plainDescription.slice(0, 160),
    isNew,
    isSale,
    tags: node.tags,
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
      image: productImageSrc(m.image?.url ?? m.product.featuredImage?.url),
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
