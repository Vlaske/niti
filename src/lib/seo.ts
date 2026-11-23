import type { Metadata } from "next";
import type { Product } from "@/types";
import { productImageSrc } from "@/lib/product-image";

/** Canonical storefront origin — override with NEXT_PUBLIC_SITE_URL in prod. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  return "https://nitihome.rs";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateMeta(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** 1200×630 JPG — required for Facebook/LinkedIn (SVG is ignored). */
const DEFAULT_OG = "/brand/og-default.jpg";

export function buildPageMetadata(input: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const description = truncateMeta(
    input.description ||
      "Kućni tekstil za spavaću sobu, kupatilo i kuhinju - posteljine, peškiri, stolnjaci i više. NITI."
  );
  const image = input.image?.trim() || DEFAULT_OG;
  const url = absoluteUrl(input.path);
  const ogImage = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    robots: input.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description,
      url,
      siteName: "NITI.",
      locale: "sr_RS",
      type: input.type ?? "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/product/${product.handle}`);
  const images = [
    productImageSrc(product.image),
    ...(product.images ?? []),
  ]
    .filter(Boolean)
    .map((src) => (src.startsWith("http") ? src : absoluteUrl(src)));

  const offerPrice = product.price;
  const description =
    truncateMeta(stripHtml(product.descriptionHtml || product.description), 300) ||
    product.title;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    image: images.slice(0, 8),
    sku: product.variants?.[0]?.sku || product.handle,
    brand: {
      "@type": "Brand",
      name: product.brand || "NITI.",
    },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "RSD",
      price: offerPrice.toFixed(2),
      availability:
        product.availableForSale === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "NITI.",
      },
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NITI.",
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/niti-apple.png"),
    email: "info@nitihome.rs",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kraljevo",
      addressCountry: "RS",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NITI.",
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
