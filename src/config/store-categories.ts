import type { Category } from "@/types";
import { PLACEHOLDER_IMAGES } from "@/config/placeholders";

/** Prostorije / programi - glavni sloj navigacije za kupca */
export type CategoryGroupId =
  | "spavaca-soba"
  | "kupatilo"
  | "kuhinja"
  | "dnevna-soba"
  | "deciji-program"
  | "hotelski-program";

export type CategoryGroup = {
  id: CategoryGroupId;
  title: string;
  description: string;
  image: string;
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "spavaca-soba",
    title: "Spavaća soba",
    description: "Posteljina, čaršavi, jastuci i slojevi za miran san.",
    image: PLACEHOLDER_IMAGES.bedroom,
  },
  {
    id: "kupatilo",
    title: "Kupatilo",
    description: "Peškiri, mantili i tekstil za svakodnevni spa osećaj.",
    image: PLACEHOLDER_IMAGES.towels,
  },
  {
    id: "kuhinja",
    title: "Kuhinja",
    description: "Stolnjaci, kuhinjske krpe i kecelje za svaki dan.",
    image: PLACEHOLDER_IMAGES.kitchen,
  },
  {
    id: "dnevna-soba",
    title: "Dnevna soba",
    description: "Dekorativni tekstil za sofu, fotelju i dnevni prostor.",
    image: PLACEHOLDER_IMAGES.living,
  },
  {
    id: "deciji-program",
    title: "Dečiji program",
    description: "Mekani i praktični proizvodi za bebe i decu.",
    image: PLACEHOLDER_IMAGES.kids,
  },
  {
    id: "hotelski-program",
    title: "Hotelski program",
    description: "Profesionalni tekstil za hotele, apartmane i ugostiteljstvo.",
    image: PLACEHOLDER_IMAGES.hotel,
  },
];

/**
 * Public storefront taxonomy.
 *
 * Ovo su kategorije koje kupac vidi na sajtu.
 * Specifične stvari poput „čaršav sa lastišem”, „nepromočivi čaršavi”,
 * „plažni peškiri”, „frotirni prekrivači” i sl. treba da budu
 * sekundarni sloj u Shopify-u: tagovi, product type, metafields ili dodatne
 * kolekcije - ne glavni nivo navigacije.
 */
export type StoreCategoryConfig = Category & {
  collectionHandle: string;
  group: CategoryGroupId;
  featured?: boolean;
  internalHandles?: string[];
  /** Keep URL, hide from mega menu / room strips */
  navHidden?: boolean;
};

export const STORE_CATEGORIES: StoreCategoryConfig[] = [
  // Spavaća soba
  {
    slug: "posteljine",
    collectionHandle: "posteljine",
    internalHandles: ["posteljine"],
    group: "spavaca-soba",
    featured: true,
    title: "Posteljine",
    description: "Kompleti posteljine u različitim dimenzijama, materijalima i dezenima.",
    image: "",
    productCount: 0,
  },
  {
    slug: "carsavi",
    collectionHandle: "carsavi",
    internalHandles: [
      "carsavi",
      "carsavi-lastis",
      "carsavi-nepromocivi",
      "carsav-lastis",
      "nepromocivi-carsavi",
    ],
    group: "spavaca-soba",
    featured: true,
    title: "Čaršavi",
    description: "Klasični, lastiš i nepromočivi čaršavi - sve na jednom mestu.",
    image: "",
    productCount: 0,
  },
  {
    slug: "jastuci",
    collectionHandle: "jastuci",
    internalHandles: ["jastuci", "memorijski-jastuci"],
    group: "spavaca-soba",
    featured: true,
    title: "Jastuci",
    description: "Jastuci za svaki stil spavanja - od klasičnih do memorijske pene.",
    image: "",
    productCount: 0,
  },
  {
    slug: "jastucnice",
    collectionHandle: "jastucnice",
    internalHandles: ["jastucnice"],
    group: "spavaca-soba",
    featured: true,
    title: "Jastučnice",
    description: "Jastučnice za krevet - pamuk, saten i dezeni.",
    image: "",
    productCount: 0,
  },
  {
    slug: "jastuci-i-jastucnice",
    collectionHandle: "jastuci-i-jastucnice",
    internalHandles: ["jastuci-i-jastucnice"],
    group: "spavaca-soba",
    navHidden: true,
    title: "Jastuci i jastučnice",
    description: "Jastuci i jastučnice na jednom mestu.",
    image: "",
    productCount: 0,
  },
  {
    slug: "jorgani-i-prekrivaci",
    collectionHandle: "jorgani-i-prekrivaci",
    internalHandles: [
      "jorgani",
      "prekrivaci",
      "frotirni-prekrivaci",
      "step-deke",
      "jorgani-spavaca-soba",
    ],
    group: "spavaca-soba",
    featured: true,
    title: "Jorgani i prekrivači",
    description: "Topli slojevi za krevet - od jorgana do dekorativnih prekrivača.",
    image: "",
    productCount: 0,
  },
  {
    slug: "cebad",
    collectionHandle: "cebad",
    internalHandles: ["cebad", "cebad-spavaca-soba"],
    group: "spavaca-soba",
    featured: true,
    title: "Ćebad",
    description: "Ćebad za dodatnu toplinu i udobnost u spavaćoj ili dnevnoj sobi.",
    image: "",
    productCount: 0,
  },
  {
    slug: "nadduseci",
    collectionHandle: "nadduseci",
    internalHandles: ["nadduseci"],
    group: "spavaca-soba",
    title: "Naddušeci",
    description: "Dodatni sloj mekoće i podrške za bolji san.",
    image: "",
    productCount: 0,
  },

  // Kupatilo
  {
    slug: "peskiri",
    collectionHandle: "peskiri",
    internalHandles: ["peskiri", "plazni-peskiri", "peskiri-kupatilo"],
    group: "kupatilo",
    featured: true,
    title: "Peškiri",
    description: "Klasični i plažni peškiri - mekani, upijajući i dugotrajni.",
    image: "",
    productCount: 0,
  },
  {
    slug: "bade-mantili",
    collectionHandle: "bade-mantili",
    internalHandles: ["bade-mantili"],
    group: "kupatilo",
    featured: true,
    title: "Bade mantili",
    description: "Pamuk, toplina i udobnost posle tuširanja ili spa rituala.",
    image: "",
    productCount: 0,
  },
  {
    slug: "kupatilski-setovi",
    collectionHandle: "kupatilski-setovi",
    internalHandles: ["kupatilski-setovi"],
    group: "kupatilo",
    title: "Kupatilski setovi",
    description: "Usklađeni setovi peškira i kupatilskog tekstila.",
    image: "",
    productCount: 0,
  },
  {
    slug: "prostirke",
    collectionHandle: "prostirke",
    internalHandles: ["prostirke", "rukavice-za-brisanje"],
    group: "kupatilo",
    title: "Prostirke i dodaci",
    description: "Kupatilske prostirke i praktični tekstilni dodaci.",
    image: "",
    productCount: 0,
  },

  // Kuhinja
  {
    slug: "stolnjaci",
    collectionHandle: "stolnjaci",
    internalHandles: ["stolnjaci", "stolnjak", "bastenski-stolnjaci"],
    group: "kuhinja",
    featured: true,
    title: "Stolnjaci",
    description: "Stolnjaci i nadstolnjaci za svakodnevnu i svečanu trpezu.",
    image: "",
    productCount: 0,
  },
  {
    slug: "kuhinjske-krpe",
    collectionHandle: "kuhinjske-krpe",
    internalHandles: ["kuhinjske-krpe", "krpe", "kuhinjske-krpe-wafle"],
    group: "kuhinja",
    featured: true,
    title: "Kuhinjske krpe",
    description: "Krpe za sudove i radnu površinu - praktične i lepe.",
    image: "",
    productCount: 0,
  },
  {
    slug: "kecelje",
    collectionHandle: "kecelje",
    internalHandles: ["kecelje", "kecelja"],
    group: "kuhinja",
    featured: true,
    title: "Kecelje",
    description: "Kuhinjske kecelje za svakodnevni rad i poklon setove.",
    image: "",
    productCount: 0,
  },

  // Dnevna soba
  {
    slug: "dekorativni-tekstil",
    collectionHandle: "dekorativni-tekstil",
    internalHandles: [
      "ukrasne-jastucnice",
      "prekrivaci-tdf",
      "dekorativni-tekstil",
      "dekorativni-jastucnice",
      "ukrasni-jastuci",
    ],
    group: "dnevna-soba",
    featured: true,
    title: "Dekorativni tekstil",
    description: "Ukrasne jastučnice i dekorativni prekrivači za dnevni prostor.",
    image: "",
    productCount: 0,
  },

  // Dečiji program
  {
    slug: "decija-posteljina",
    collectionHandle: "decija-posteljina",
    internalHandles: [
      "decija-posteljina",
      "decije-posteljine",
      "deciji-program",
    ],
    group: "deciji-program",
    featured: true,
    title: "Dečija posteljina",
    description: "Posteljina i kompleti prilagođeni dečijim krevetima i dezenima.",
    image: "",
    productCount: 0,
  },
  {
    slug: "decija-cebad",
    collectionHandle: "decija-cebad",
    internalHandles: ["decija-cebad", "decije-cebad"],
    group: "deciji-program",
    featured: true,
    title: "Dečija ćebad",
    description: "Meka ćebad i lagani prekrivači za bebe i decu.",
    image: "",
    productCount: 0,
  },
  {
    slug: "deciji-jastuci-i-jastucnice",
    collectionHandle: "deciji-jastuci",
    internalHandles: [
      "deciji-jastuci",
      "decije-jastucnice",
      "decija-jastucnica",
    ],
    group: "deciji-program",
    featured: true,
    title: "Dečiji jastuci",
    description: "Jastuci i jastučnice za dečije krevete.",
    image: "",
    productCount: 0,
  },
  {
    slug: "deciji-peskiri",
    collectionHandle: "deciji-peskiri",
    internalHandles: ["deciji-peskiri", "deciji-peskir"],
    group: "deciji-program",
    title: "Dečiji peškiri",
    description: "Peškiri i kupatilski tekstil za najmlađe.",
    image: "",
    productCount: 0,
  },

  // Hotelski program
  {
    slug: "hotelski-program",
    collectionHandle: "hotelski-program",
    internalHandles: [
      "hotelski-program",
      "ponuda-hotelskog-programa-viktorija",
    ],
    group: "hotelski-program",
    title: "Hotelski program",
    description: "Peškiri, posteljina i oprema za hotele, apartmane i smeštaj.",
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
  return (
    handleSet.has(handle) ||
    STORE_CATEGORIES.some((c) => c.internalHandles?.includes(handle))
  );
}

const groupIdSet = new Set(CATEGORY_GROUPS.map((g) => g.id));

export function isCategoryGroupId(slug: string): slug is CategoryGroupId {
  return groupIdSet.has(slug as CategoryGroupId);
}

export function getGroupHref(id: CategoryGroupId): string {
  return `/shop/${id}`;
}

export function getGroupSlugs(): string[] {
  return CATEGORY_GROUPS.map((g) => g.id);
}

export function getStoreCategoryBySlug(
  slug: string
): StoreCategoryConfig | undefined {
  return STORE_CATEGORIES.find((c) => c.slug === slug);
}

export function getStoreCategoryByCollectionHandle(
  handle: string
): StoreCategoryConfig | undefined {
  return STORE_CATEGORIES.find(
    (c) =>
      c.collectionHandle === handle || c.internalHandles?.includes(handle)
  );
}

export function getCategorySlugs(): string[] {
  return STORE_CATEGORIES.map((c) => c.slug);
}

export function getCategoryGroups(): CategoryGroup[] {
  return CATEGORY_GROUPS;
}

export function getGroupById(id: CategoryGroupId): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.id === id);
}

export function getCategoriesByGroup(
  groupId: CategoryGroupId
): StoreCategoryConfig[] {
  return STORE_CATEGORIES.filter((c) => c.group === groupId && !c.navHidden);
}

export function getFeaturedCategories(): StoreCategoryConfig[] {
  return STORE_CATEGORIES.filter((c) => c.featured && !c.navHidden);
}

export function getGroupForCategorySlug(
  slug: string
): CategoryGroupId | undefined {
  if (isCategoryGroupId(slug)) return slug;
  return getStoreCategoryBySlug(slug)?.group;
}

/**
 * Shopify kolekcije koje često drže dečije / hotelske artikle
 * iako javna kategorija nije ta kolekcija.
 */
const KIDS_OVERLAP_HANDLES = [
  "posteljine",
  "carsavi",
  "peskiri",
  "cebad",
  "jastuci",
  "jastucnice",
  "jastuci-i-jastucnice",
  "jorgani-i-prekrivaci",
  "prekrivaci",
] as const;

const LIVING_OVERLAP_HANDLES = [
  "ukrasne-jastucnice",
  "prekrivaci-tdf",
  "jastucnice",
  "prekrivaci",
  "jorgani-i-prekrivaci",
] as const;

const HOTEL_OVERLAP_HANDLES = [
  "peskiri",
  "posteljine",
  "carsavi",
  "jastuci-i-jastucnice",
  "jastuci",
  "jastucnice",
] as const;

export function getCollectionHandlesForSlug(slug: string): string[] {
  const handles = new Set<string>();

  if (isCategoryGroupId(slug)) {
    handles.add(slug);
    for (const cat of getCategoriesByGroup(slug)) {
      handles.add(cat.collectionHandle);
      cat.internalHandles?.forEach((h) => handles.add(h));
    }
    if (slug === "deciji-program") {
      KIDS_OVERLAP_HANDLES.forEach((h) => handles.add(h));
    }
    if (slug === "dnevna-soba") {
      LIVING_OVERLAP_HANDLES.forEach((h) => handles.add(h));
    }
    if (slug === "hotelski-program") {
      HOTEL_OVERLAP_HANDLES.forEach((h) => handles.add(h));
    }
    return [...handles];
  }

  const cat = getStoreCategoryBySlug(slug);
  if (!cat) return [slug];

  handles.add(cat.collectionHandle);
  cat.internalHandles?.forEach((h) => handles.add(h));

  if (cat.group === "deciji-program") {
    KIDS_OVERLAP_HANDLES.forEach((h) => handles.add(h));
  }
  if (cat.group === "dnevna-soba") {
    LIVING_OVERLAP_HANDLES.forEach((h) => handles.add(h));
  }
  if (cat.group === "hotelski-program") {
    HOTEL_OVERLAP_HANDLES.forEach((h) => handles.add(h));
  }

  return [...handles];
}

/** Tagovi koji imaju smisla kao „refine” unutar jedne leaf kategorije */
export const LEAF_REFINE_TAGS: Record<string, string[]> = {
  carsavi: ["filter:lastis", "filter:nepromociv", "filter:klasicni"],
  peskiri: ["filter:kupatilski", "filter:plazni"],
  jastuci: ["filter:memorijska-pena"],
  jastucnice: ["filter:ukrasne-jastucnice"],
  "jastuci-i-jastucnice": [
    "filter:jastuci",
    "filter:jastucnice",
    "filter:memorijska-pena",
  ],
  "jorgani-i-prekrivaci": [
    "filter:jorgani",
    "filter:prekrivaci",
    "filter:frotirni",
    "filter:step-deke",
  ],
  "dekorativni-tekstil": [
    "filter:ukrasne-jastucnice",
    "filter:dekorativni-prekrivaci",
  ],
  posteljine: ["filter:set"],
};

export const FILTER_TAG_LABELS: Record<string, string> = {
  "filter:set": "Setovi",
  "filter:lastis": "Lastiš",
  "filter:nepromociv": "Nepromočivi",
  "filter:klasicni": "Klasični",
  "filter:jastuci": "Jastuci",
  "filter:jastucnice": "Jastučnice",
  "filter:jorgani": "Jorgani",
  "filter:prekrivaci": "Prekrivači",
  "filter:frotirni": "Frotir",
  "filter:step-deke": "Štep deke",
  "filter:kupatilski": "Kupatilski",
  "filter:plazni": "Plažni",
  "filter:prostirke": "Prostirke",
  "filter:rukavice": "Rukavice",
  "filter:ukrasne-jastucnice": "Ukrasne jastučnice",
  "filter:dekorativni-prekrivaci": "Dekorativni prekrivači",
  "filter:cebad": "Ćebad",
  "filter:posteljina": "Posteljina",
  "filter:memorijska-pena": "Memorijska pena",
};

/** Unique slugs for /shop/[category] - rooms + leaf categories */
export function getShopRouteSlugs(): string[] {
  return Array.from(new Set([...getGroupSlugs(), ...getCategorySlugs()]));
}

/** Za komponente koje očekuju Category[] bez collectionHandle / group */
export function getNavCategories(): Category[] {
  return STORE_CATEGORIES.filter((c) => !c.navHidden).map(
    ({
      collectionHandle: _h,
      group: _g,
      featured: _f,
      navHidden: _n,
      internalHandles: _i,
      ...cat
    }) => cat
  );
}

/** Grupisane kategorije za mega meni */
export function getGroupedNavCategories(): {
  group: CategoryGroup;
  categories: Category[];
}[] {
  return CATEGORY_GROUPS.map((group) => ({
    group,
    categories: getCategoriesByGroup(group.id).map(
      ({
        collectionHandle: _h,
        group: _g,
        featured: _f,
        navHidden: _n,
        internalHandles: _i,
        ...cat
      }) => cat
    ),
  })).filter((entry) => entry.categories.length > 0);
}

/** Combined storefront pages that include several leaf slugs */
export const COMBINED_CATEGORY_MEMBERS: Record<string, string[]> = {
  "jastuci-i-jastucnice": ["jastuci", "jastucnice"],
};

export function expandCategorySlug(slug: string): string[] {
  const members = COMBINED_CATEGORY_MEMBERS[slug];
  return members ? [slug, ...members] : [slug];
}

export function getProductCategorySlugs(product: {
  category: string;
  categories?: string[];
}): string[] {
  const slugs = product.categories?.length
    ? product.categories
    : [product.category];
  return [...new Set(slugs.filter(Boolean))];
}

/** Product appears in this room or leaf - supports overlap. */
export function productMatchesCategory(
  product: { category: string; categories?: string[] },
  slug: string
): boolean {
  const productSlugs = getProductCategorySlugs(product);
  if (isCategoryGroupId(slug)) {
    return productSlugs.some((s) => getGroupForCategorySlug(s) === slug);
  }
  const wanted = new Set(expandCategorySlug(slug));
  return productSlugs.some((s) =>
    expandCategorySlug(s).some((part) => wanted.has(part))
  );
}
