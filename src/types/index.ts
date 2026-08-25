export type ProductColor = {
  name: string;
  hex: string;
  /** Shopify ProductVariant GID when using Storefront API */
  variantId?: string;
  /** Variant image when Shopify provides one for this color */
  image?: string;
};

export type ProductOptionValue = {
  value: string;
  hex?: string;
  available: boolean;
  image?: string;
};

export type ProductOption = {
  name: string;
  label: string;
  type: "color" | "size" | "other";
  values: ProductOptionValue[];
};

export type ProductVariantSnapshot = {
  id: string;
  availableForSale: boolean;
  price: number;
  compareAtPrice?: number;
  selectedOptions: { name: string; value: string }[];
  image?: string;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  /** Shopify HTML opis */
  descriptionHtml?: string;
  price: number;
  compareAtPrice?: number;
  /** Primary leaf for breadcrumbs / card label */
  category: string;
  /** All leaf categories this product belongs to (can overlap) */
  categories?: string[];
  collection?: string;
  image: string;
  images?: string[];
  /** Gallery with alt text — used to match color → image */
  media?: { url: string; altText?: string }[];
  /** Resolved color value → image URL (unique per color only) */
  colorImages?: Record<string, string>;
  /** @deprecated Koristi options */
  colors?: ProductColor[];
  options?: ProductOption[];
  variants?: ProductVariantSnapshot[];
  tagline?: string;
  isNew?: boolean;
  isSale?: boolean;
  /** Default variant GID for cart (Shopify) */
  variantId?: string;
  availableForSale?: boolean;
  tags?: string[];
};

export type Category = {
  slug: string;
  title: string;
  description: string;
  image: string;
  productCount: number;
};

export type CategoryGroup = {
  id: string;
  title: string;
  description: string;
};

export type Collection = {
  slug: string;
  title: string;
  image: string;
  productCount: number;
  description?: string;
};

export type HeroMediaType = "image" | "video";

export type HeroSlide = {
  id: string;
  category: string;
  headline: string;
  /** Append logo wordmark “NITI.” in Playfair after the headline */
  brandMark?: boolean;
  subheadline?: string;
  description: string;
  /** @deprecated use mediaSrc — kept for backwards compatibility */
  image: string;
  /** image URL or video path under /public (e.g. /videos/hero.mp4) */
  mediaSrc?: string;
  mediaType?: HeroMediaType;
  /** Poster frame when mediaType is video */
  poster?: string;
  productTag?: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export type CartItem = {
  product: Product;
  quantity: number;
  selectedColor?: string;
  /** Shopify cart line GID */
  lineId?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};
