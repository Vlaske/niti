export type ProductColor = {
  name: string;
  hex: string;
  /** Shopify ProductVariant GID when using Storefront API */
  variantId?: string;
};

export type ProductOptionValue = {
  value: string;
  hex?: string;
  available: boolean;
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
  category: string;
  collection?: string;
  image: string;
  images?: string[];
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
};

export type Category = {
  slug: string;
  title: string;
  description: string;
  image: string;
  productCount: number;
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
