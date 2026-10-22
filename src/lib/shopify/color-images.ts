import { isColorOptionName } from "@/lib/shopify/variants";

type MediaNode = { url: string; altText?: string | null };
type ImageRef = { id?: string; url: string; altText?: string | null };
type VariantNode = {
  title?: string;
  selectedOptions: { name: string; value: string }[];
  image?: string | ImageRef | null;
};

export type ShopifyOptionValueNode = {
  name: string;
  swatch?: {
    color?: string | null;
    image?: {
      image?: { url: string; altText?: string | null } | null;
    } | null;
  } | null;
  firstSelectableVariant?: {
    image?: { id?: string; url: string; altText?: string | null } | null;
  } | null;
};

function normalizeColorKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "");
}

export function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function getVariantImage(v: VariantNode): ImageRef | undefined {
  if (!v.image) return undefined;
  if (typeof v.image === "string") {
    const url = v.image.trim();
    return url ? { url } : undefined;
  }
  const url = v.image.url?.trim();
  return url ? { url, id: v.image.id, altText: v.image.altText } : undefined;
}

function getVariantImageUrl(v: VariantNode): string | undefined {
  return getVariantImage(v)?.url;
}

/** Does alt text / variant label refer to this color option value? */
export function mediaMatchesColor(
  media: { altText?: string | null },
  color: string
): boolean {
  const alt = normalizeColorKey(media.altText ?? "");
  const key = normalizeColorKey(color);
  if (!alt || !key) return false;
  if (alt === key) return true;
  if (alt.includes(key) || key.includes(alt)) return true;
  const first = alt.split(/[/\-–|]/)[0]?.trim();
  return Boolean(first && normalizeColorKey(first) === key);
}

function isFallbackImage(
  image: ImageRef | undefined,
  featured?: ImageRef
): boolean {
  if (!image?.url) return true;
  if (featured?.id && image.id && image.id === featured.id) return true;
  if (featured?.url && normalizeImageUrl(image.url) === normalizeImageUrl(featured.url)) {
    return true;
  }
  return false;
}

function getFallbackImageUrl(
  variants: VariantNode[],
  featured?: ImageRef
): string | undefined {
  const counts = new Map<string, number>();
  for (const v of variants) {
    const image = getVariantImage(v);
    if (!image?.url) continue;
    const key = normalizeImageUrl(image.url);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  if (counts.size) {
    const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (top && top[1] >= Math.max(2, variants.length * 0.2)) {
      return top[0];
    }
  }

  return featured?.url ? normalizeImageUrl(featured.url) : undefined;
}

function isFallbackUrl(url: string, fallback?: string): boolean {
  if (!fallback) return false;
  return normalizeImageUrl(url) === fallback;
}

function pickDedicatedUrlForColor(
  variants: VariantNode[],
  color: string,
  colorOptionName: string,
  featured?: ImageRef,
  fallback?: string
): string | undefined {
  const counts = new Map<string, { url: string; count: number }>();

  for (const v of variants) {
    const matchesColor = v.selectedOptions.some(
      (o) => o.name === colorOptionName && o.value === color
    );
    if (!matchesColor) continue;

    const image = getVariantImage(v);
    if (!image?.url || isFallbackImage(image, featured)) continue;
    if (fallback && isFallbackUrl(image.url, fallback)) continue;

    const key = normalizeImageUrl(image.url);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { url: image.url, count: 1 });
    }
  }

  const best = [...counts.values()].sort((a, b) => b.count - a.count)[0];
  return best?.url;
}

function buildUrlColorOwnership(
  variants: VariantNode[],
  colorOptionName: string,
  featured?: ImageRef,
  fallback?: string
): Map<string, { url: string; colors: Set<string> }> {
  const map = new Map<string, { url: string; colors: Set<string> }>();

  for (const v of variants) {
    const color = v.selectedOptions.find(
      (o) => o.name === colorOptionName
    )?.value;
    const image = getVariantImage(v);
    if (
      !color ||
      !image?.url ||
      isFallbackImage(image, featured) ||
      (fallback && isFallbackUrl(image.url, fallback))
    ) {
      continue;
    }

    const key = normalizeImageUrl(image.url);
    const entry = map.get(key) ?? { url: image.url, colors: new Set<string>() };
    entry.colors.add(color);
    map.set(key, entry);
  }

  return map;
}

function applyShopifySwatches(
  optionValues: ShopifyOptionValueNode[] | undefined,
  featured: ImageRef | undefined,
  fallback: string | undefined,
  result: Record<string, string>
): void {
  for (const ov of optionValues ?? []) {
    if (result[ov.name]) continue;

    const swatchUrl = ov.swatch?.image?.image?.url?.trim();
    if (swatchUrl) {
      result[ov.name] = swatchUrl;
      continue;
    }

    const variantImage = ov.firstSelectableVariant?.image;
    const variantUrl = variantImage?.url?.trim();
    if (
      variantUrl &&
      !isFallbackImage(
        variantImage?.id
          ? {
              id: variantImage.id,
              url: variantUrl,
              altText: variantImage.altText,
            }
          : { url: variantUrl, altText: variantImage?.altText },
        featured
      ) &&
      !(fallback && isFallbackUrl(variantUrl, fallback))
    ) {
      result[ov.name] = variantUrl;
    }
  }
}

function applyVariantTitleMediaMatch(
  colorValues: string[],
  variants: VariantNode[],
  media: MediaNode[],
  colorOptionName: string,
  featured: ImageRef | undefined,
  fallback: string | undefined,
  result: Record<string, string>
): void {
  for (const color of colorValues) {
    if (result[color]) continue;

    for (const v of variants) {
      const matchesColor = v.selectedOptions.some(
        (o) => o.name === colorOptionName && o.value === color
      );
      if (!matchesColor) continue;

      const image = getVariantImage(v);
      if (
        image?.url &&
        !isFallbackImage(image, featured) &&
        !(fallback && isFallbackUrl(image.url, fallback))
      ) {
        result[color] = image.url;
        break;
      }

      if (!v.title) continue;
      const title = v.title;
      const mediaHit = media.find(
        (m) =>
          m.url?.trim() &&
          (mediaMatchesColor(m, color) || mediaMatchesColor(m, title))
      );
      if (mediaHit) {
        result[color] = mediaHit.url;
        break;
      }
    }
  }
}

/**
 * Map each color value to a gallery or variant image using Shopify data first,
 * then variant ownership / alt-text heuristics. Never guesses by gallery order.
 */
export function buildColorImageMap(
  colorValues: string[],
  variants: VariantNode[],
  media: MediaNode[],
  colorOptionName: string,
  extras?: {
    featured?: ImageRef;
    optionValues?: ShopifyOptionValueNode[];
  }
): Record<string, string> {
  const result: Record<string, string> = {};
  const featured = extras?.featured;
  const fallback = getFallbackImageUrl(variants, featured);

  applyShopifySwatches(extras?.optionValues, featured, fallback, result);

  for (const color of colorValues) {
    if (result[color]) continue;
    const mediaHit = media.find(
      (m) => m.url?.trim() && mediaMatchesColor(m, color)
    );
    if (mediaHit) result[color] = mediaHit.url;
  }

  for (const color of colorValues) {
    if (result[color]) continue;
    const dedicated = pickDedicatedUrlForColor(
      variants,
      color,
      colorOptionName,
      featured,
      fallback
    );
    if (dedicated) result[color] = dedicated;
  }

  applyVariantTitleMediaMatch(
    colorValues,
    variants,
    media,
    colorOptionName,
    featured,
    fallback,
    result
  );

  const ownership = buildUrlColorOwnership(
    variants,
    colorOptionName,
    featured,
    fallback
  );
  for (const color of colorValues) {
    if (result[color]) continue;
    for (const { url, colors } of ownership.values()) {
      if (colors.size === 1 && colors.has(color)) {
        result[color] = url;
        break;
      }
    }
  }

  for (const color of colorValues) {
    if (result[color]) continue;
    const mediaHit = media.find((m) => {
      if (!m.url?.trim()) return false;
      const key = normalizeImageUrl(m.url);
      for (const { url, colors } of ownership.values()) {
        if (normalizeImageUrl(url) === key && colors.size === 1 && colors.has(color)) {
          return true;
        }
      }
      return false;
    });
    if (mediaHit) result[color] = mediaHit.url;
  }

  // A color whose only photo is the featured image was skipped above on purpose,
  // so it would not be copied onto every color. If that color really owns the
  // featured shot, keep it — otherwise switching back to it has no image.
  for (const color of colorValues) {
    if (result[color]) continue;
    const urlsForColor: string[] = [];
    for (const v of variants) {
      const matchesColor = v.selectedOptions.some(
        (o) => o.name === colorOptionName && o.value === color
      );
      if (!matchesColor) continue;
      const url = getVariantImageUrl(v);
      if (url) urlsForColor.push(url);
    }
    const unique = new Set(urlsForColor.map(normalizeImageUrl));
    if (unique.size === 1 && urlsForColor[0]) {
      result[color] = urlsForColor[0];
    }
  }

  const urls = Object.values(result);
  if (urls.length > 1 && new Set(urls.map(normalizeImageUrl)).size === 1) {
    return {};
  }

  return result;
}

export function resolveImageForColor(
  color: string,
  colorImages: Record<string, string> | undefined,
  media: MediaNode[] | undefined,
  variants: VariantNode[] | undefined,
  colorOptionName: string | undefined
): string | undefined {
  if (colorImages?.[color]) return colorImages[color];

  const mediaHit = media?.find(
    (m) => m.url?.trim() && mediaMatchesColor(m, color)
  );
  if (mediaHit) return mediaHit.url;

  if (!variants?.length || !colorOptionName) return undefined;

  const map = buildColorImageMap(
    [color],
    variants,
    media ?? [],
    colorOptionName
  );
  return map[color];
}

export function findColorOptionName(
  options: { name: string; values: string[] }[]
): string | undefined {
  return options.find((o) => isColorOptionName(o.name))?.name;
}

export function getSwatchHex(
  optionValue: ShopifyOptionValueNode | undefined,
  fallbackValue: string
): string | undefined {
  const raw = optionValue?.swatch?.color?.trim();
  return raw || undefined;
}

export function getSwatchImageUrl(
  optionValue: ShopifyOptionValueNode | undefined
): string | undefined {
  return optionValue?.swatch?.image?.image?.url?.trim() || undefined;
}
