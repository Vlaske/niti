import type { Category } from "@/types";

/**
 * Kolekcije u Shopify-u koje su istovremeno **kategorije** na sajtu (nav, /shop/[slug]).
 * Ostale kolekcije u Admin-u (npr. sezonske, istaknuto) ne dodaj ovde — proizvodi
 * i dalje mogu biti u njima, ali se prikazuju samo pod „Sva ponuda”.
 *
 * slug = URL (/shop/posteljine)
 * collectionHandle = handle kolekcije u Shopify-u (mora da se poklapa)
 */
export type StoreCategoryConfig = Category & {
  collectionHandle: string;
};

export const STORE_CATEGORIES: StoreCategoryConfig[] = [
  {
    slug: "posteljine",
    collectionHandle: "posteljine",
    title: "Posteljine",
    description:
      "Kompleti, plahte i navlake u pastelnim tonovima — premium posteljina za miran san.",
    image: "",
    productCount: 0,
  },
  {
    slug: "carsavi",
    collectionHandle: "carsavi",
    title: "Čaršavi",
    description:
      "Plahte i čaršavi od prirodnih materijala — mekani dodir i dugotrajna belina.",
    image: "",
    productCount: 0,
  },
  {
    slug: "jastuci",
    collectionHandle: "jastuci",
    title: "Jastuci",
    description:
      "Jastuci i jastučnice za svaki stil spavanja — od perja do memorijske pene.",
    image: "",
    productCount: 0,
  },
  {
    slug: "peskiri",
    collectionHandle: "peskiri",
    title: "Peškiri",
    description:
      "Frotiri i peškiri spa kvaliteta — mekani, upijajući i izdržljivi za svakodnevnu upotrebu.",
    image: "",
    productCount: 0,
  },
];

/** slug → Shopify collection handle */
export const CATEGORY_COLLECTION_HANDLES: Record<string, string> =
  Object.fromEntries(
    STORE_CATEGORIES.map((c) => [c.slug, c.collectionHandle])
  );

const slugSet = new Set(STORE_CATEGORIES.map((c) => c.slug));
const handleSet = new Set(STORE_CATEGORIES.map((c) => c.collectionHandle));

export function isNavCategorySlug(slug: string): boolean {
  return slugSet.has(slug);
}

export function isNavCategoryCollection(handle: string): boolean {
  return handleSet.has(handle);
}

export function getStoreCategoryBySlug(slug: string): StoreCategoryConfig | undefined {
  return STORE_CATEGORIES.find((c) => c.slug === slug);
}

export function getStoreCategoryByCollectionHandle(
  handle: string
): StoreCategoryConfig | undefined {
  return STORE_CATEGORIES.find((c) => c.collectionHandle === handle);
}

export function getCategorySlugs(): string[] {
  return STORE_CATEGORIES.map((c) => c.slug);
}

/** Za komponente koje očekuju Category[] bez collectionHandle */
export function getNavCategories(): Category[] {
  return STORE_CATEGORIES.map(({ collectionHandle: _h, ...cat }) => cat);
}
