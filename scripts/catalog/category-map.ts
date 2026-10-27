/**
 * Viktorija WooCommerce category slug → NITI public collection + tags.
 * Source of truth: CATEGORY_ARCHITECTURE.md / CATALOG.md
 */

export type CategoryMapResult = {
  collectionHandle: string;
  /** Extra filter tags (without niti:/room: prefixes — those are added later) */
  tags: string[];
  /** Prefer this leaf over room parents when multiple cats present */
  priority: number;
};

export const COLLECTION_TO_GROUP: Record<string, string> = {
  posteljine: "spavaca-soba",
  carsavi: "spavaca-soba",
  "jastuci-i-jastucnice": "spavaca-soba",
  jastuci: "spavaca-soba",
  jastucnice: "spavaca-soba",
  "jorgani-i-prekrivaci": "spavaca-soba",
  cebad: "spavaca-soba",
  nadduseci: "spavaca-soba",
  peskiri: "kupatilo",
  "bade-mantili": "kupatilo",
  "kupatilski-setovi": "kupatilo",
  prostirke: "kupatilo",
  stolnjaci: "kuhinja",
  "kuhinjske-krpe": "kuhinja",
  kecelje: "kuhinja",
  "dekorativni-tekstil": "dnevna-soba",
  "decija-posteljina": "deciji-program",
  "decija-cebad": "deciji-program",
  "deciji-jastuci": "deciji-program",
  "deciji-peskiri": "deciji-program",
  "hotelski-program": "hotelski-program",
};

export const COLLECTION_TITLES: Record<string, string> = {
  posteljine: "Posteljine",
  carsavi: "Čaršavi",
  "jastuci-i-jastucnice": "Jastuci i jastučnice",
  jastuci: "Jastuci",
  jastucnice: "Jastučnice",
  "jorgani-i-prekrivaci": "Jorgani i prekrivači",
  cebad: "Ćebad",
  nadduseci: "Naddušeci",
  peskiri: "Peškiri",
  "bade-mantili": "Bade mantili",
  "kupatilski-setovi": "Kupatilski setovi",
  prostirke: "Prostirke i dodaci",
  stolnjaci: "Stolnjaci",
  "kuhinjske-krpe": "Kuhinjske krpe",
  kecelje: "Kecelje",
  "dekorativni-tekstil": "Dekorativni tekstil",
  "decija-posteljina": "Dečija posteljina",
  "decija-cebad": "Dečija ćebad",
  "deciji-jastuci": "Dečiji jastuci",
  "deciji-peskiri": "Dečiji peškiri",
  "hotelski-program": "Hotelski program",
};

export const GROUP_TITLES: Record<string, string> = {
  "spavaca-soba": "Spavaća soba",
  kupatilo: "Kupatilo",
  kuhinja: "Kuhinja",
  "dnevna-soba": "Dnevna soba",
  "deciji-program": "Dečiji program",
  "hotelski-program": "Hotelski program",
};

export const GROUP_DESCRIPTIONS: Record<string, string> = {
  "spavaca-soba": "Posteljina, čaršavi, jastuci i slojevi za miran san.",
  kupatilo: "Peškiri, mantili i tekstil za svakodnevni spa osećaj.",
  kuhinja: "Stolnjaci, kuhinjske krpe i kecelje za svaki dan.",
  "dnevna-soba": "Dekorativni tekstil za sofu, fotelju i dnevni prostor.",
  "deciji-program": "Mekani i praktični proizvodi za bebe i decu.",
  "hotelski-program":
    "Profesionalni tekstil za hotele, apartmane i ugostiteljstvo.",
};

export const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  posteljine:
    "Kompleti posteljine u različitim dimenzijama, materijalima i dezenima.",
  carsavi: "Klasični, lastiš i nepromočivi čaršavi — sve na jednom mestu.",
  "jastuci-i-jastucnice":
    "Jastuci za svaki stil spavanja i odgovarajuće jastučnice.",
  "jorgani-i-prekrivaci":
    "Topli slojevi za krevet — od jorgana do dekorativnih prekrivača.",
  cebad: "Ćebad za dodatnu toplinu i udobnost u spavaćoj ili dnevnoj sobi.",
  nadduseci: "Dodatni sloj mekoće i podrške za bolji san.",
  peskiri: "Klasični i plažni peškiri — mekani, upijajući i dugotrajni.",
  "bade-mantili": "Pamuk, toplina i udobnost posle tuširanja ili spa rituala.",
  "kupatilski-setovi": "Usklađeni setovi peškira i kupatilskog tekstila.",
  prostirke: "Kupatilske prostirke i praktični tekstilni dodaci.",
  stolnjaci: "Stolnjaci i nadstolnjaci za svakodnevnu i svečanu trpezu.",
  "kuhinjske-krpe": "Krpe za sudove i radnu površinu — praktične i lepe.",
  kecelje: "Kuhinjske kecelje za svakodnevni rad i poklon setove.",
  "dekorativni-tekstil":
    "Ukrasne jastučnice i dekorativni prekrivači za dnevni prostor.",
  "decija-posteljina":
    "Posteljina i kompleti prilagođeni dečijim krevetima i dezenima.",
  "decija-cebad": "Meka ćebad i lagani prekrivači za bebe i decu.",
  "deciji-jastuci": "Jastuci i jastučnice za dečije krevete.",
  "deciji-peskiri": "Peškiri i kupatilski tekstil za najmlađe.",
  "hotelski-program":
    "Peškiri, posteljina i oprema za hotele, apartmane i smeštaj.",
};

export type CategoryMapOutcome =
  | { kind: "map"; result: CategoryMapResult }
  | { kind: "exclude"; reason: string }
  | { kind: "skip"; reason: string }
  | { kind: "unmapped" };

/** Categories we intentionally do not import into the public NITI catalog. */
export const EXCLUDED_CATEGORY_SLUGS = new Set([
  "texas-jakne-i-farmerice",
  "pidzame",
  "bastenski-program",
]);

/** Room / parent buckets — never chosen alone as the product collection. */
export const PARENT_CATEGORY_SLUGS = new Set([
  "spavaca-soba",
  "kupatilo",
  "kuhinja",
  "dnevna-soba",
  "deciji-program",
  "hotelski-program",
]);

/**
 * Serbian / CSV category labels → Woo-style slugs used in CATEGORY_MAP.
 * Keys are latinized lowercase (see normalizeCategoryLabel).
 */
export const CATEGORY_LABEL_TO_SLUG: Record<string, string> = {
  "spavaca soba": "spavaca-soba",
  kupatilo: "kupatilo",
  kuhinja: "kuhinja",
  "dnevna soba": "dnevna-soba",
  "deciji program": "deciji-program",
  "hotelski program": "hotelski-program",
  "bastenski program": "bastenski-program",
  posteljine: "posteljine",
  setovi: "setovi",
  "setovi posteljine": "setovi-posteljine",
  carsavi: "carsavi",
  "carsav lastis": "carsav-lastis",
  "nepromocivi carsavi": "nepromocivi-carsavi",
  jastuci: "jastuci",
  jastucnice: "jastucnice",
  "memorijski jastuci": "memorijski-jastuci",
  "memorijska pena": "memorijska-pena",
  jorgani: "jorgani-spavaca-soba",
  prekrivaci: "prekrivaci",
  "frotirni prekrivaci": "frotirni-prekrivaci",
  "step deke": "step-deke",
  cebad: "cebad-spavaca-soba",
  nadduseci: "nadduseci",
  pidzame: "pidzame",
  peskiri: "peskiri-kupatilo",
  "plazni peskiri": "plazni-peskiri",
  "bade mantili": "bade-mantili",
  prostirke: "prostirke",
  "rukavice za brisanje": "rukavice-za-brisanje",
  stolnjaci: "stolnjaci",
  krpe: "krpe",
  kecelje: "kecelje",
  "ukrasne jastucnice": "ukrasne-jastucnice",
  "prekrivaci tdf": "prekrivaci-tdf",
  "decija cebad": "decija-cebad",
  "deciji jastuci": "deciji-jastuci",
  "decije jastucnice": "decije-jastucnice",
  "decija posteljina": "decija-posteljina",
  "decije posteljine": "decije-posteljine",
  "deciji peskiri": "deciji-peskiri",
  "ponuda hotelskog programa viktorija":
    "ponuda-hotelskog-programa-viktorija",
  "texas jakne i farmerice": "texas-jakne-i-farmerice",
};

/** Normalize a category name for alias lookup. */
export function normalizeCategoryLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Turn "Kupatilo > Peškiri" / comma lists into Woo-style slugs. */
export function categoryPathsToSlugs(raw: string): {
  slugs: string[];
  paths: string[];
} {
  const paths = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const slugs = new Set<string>();

  for (const pathStr of paths) {
    const parts = pathStr
      .split(/>/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts) {
      const key = normalizeCategoryLabel(part);
      const mapped = CATEGORY_LABEL_TO_SLUG[key];
      if (mapped) {
        slugs.add(mapped);
        continue;
      }
      const fallback = key.replace(/\s+/g, "-");
      if (fallback) slugs.add(fallback);
    }
  }

  return { slugs: [...slugs], paths };
}

export const CATEGORY_MAP: Record<string, CategoryMapResult> = {
  // Aliases for CSV short slugs
  peskiri: {
    collectionHandle: "peskiri",
    tags: ["filter:kupatilski"],
    priority: 50,
  },
  cebad: {
    collectionHandle: "cebad",
    tags: [],
    priority: 50,
  },
  jorgani: {
    collectionHandle: "jorgani-i-prekrivaci",
    tags: ["filter:jorgani"],
    priority: 50,
  },

  // Spavaća soba — explicit leaf → NITI mapping (higher priority wins)
  posteljine: {
    collectionHandle: "posteljine",
    tags: [],
    priority: 50,
  },
  "setovi-posteljine": {
    collectionHandle: "posteljine",
    tags: ["filter:set"],
    priority: 55,
  },
  carsavi: {
    collectionHandle: "carsavi",
    tags: ["filter:klasicni"],
    priority: 50,
  },
  "carsav-lastis": {
    collectionHandle: "carsavi",
    tags: ["filter:lastis"],
    priority: 60,
  },
  "nepromocivi-carsavi": {
    collectionHandle: "carsavi",
    tags: ["filter:nepromociv"],
    priority: 60,
  },
  jastuci: {
    collectionHandle: "jastuci-i-jastucnice",
    tags: ["filter:jastuci"],
    priority: 50,
  },
  jastucnice: {
    collectionHandle: "jastuci-i-jastucnice",
    tags: ["filter:jastucnice"],
    priority: 50,
  },
  "memorijski-jastuci": {
    collectionHandle: "jastuci-i-jastucnice",
    tags: ["filter:jastuci", "filter:memorijska-pena"],
    priority: 55,
  },
  "memorijska-pena": {
    collectionHandle: "jastuci-i-jastucnice",
    tags: ["filter:jastuci", "filter:memorijska-pena"],
    priority: 40,
  },
  "jorgani-spavaca-soba": {
    collectionHandle: "jorgani-i-prekrivaci",
    tags: ["filter:jorgani"],
    priority: 50,
  },
  prekrivaci: {
    collectionHandle: "jorgani-i-prekrivaci",
    tags: ["filter:prekrivaci"],
    priority: 50,
  },
  "frotirni-prekrivaci": {
    collectionHandle: "jorgani-i-prekrivaci",
    tags: ["filter:prekrivaci", "filter:frotirni"],
    priority: 55,
  },
  "step-deke": {
    collectionHandle: "jorgani-i-prekrivaci",
    tags: ["filter:step-deke"],
    priority: 55,
  },
  "cebad-spavaca-soba": {
    collectionHandle: "cebad",
    tags: [],
    priority: 50,
  },
  nadduseci: {
    collectionHandle: "nadduseci",
    tags: [],
    priority: 80,
  },

  // Kupatilo
  "peskiri-kupatilo": {
    collectionHandle: "peskiri",
    tags: ["filter:kupatilski"],
    priority: 50,
  },
  "plazni-peskiri": {
    collectionHandle: "plazni-peskiri",
    tags: ["filter:plazni"],
    priority: 60,
  },
  "bade-mantili": {
    collectionHandle: "bade-mantili",
    tags: [],
    priority: 50,
  },
  setovi: {
    collectionHandle: "kupatilski-setovi",
    tags: ["filter:set"],
    priority: 50,
  },
  prostirke: {
    collectionHandle: "prostirke",
    tags: ["filter:prostirke"],
    priority: 50,
  },
  "rukavice-za-brisanje": {
    collectionHandle: "prostirke",
    tags: ["filter:rukavice"],
    priority: 55,
  },

  // Kuhinja
  stolnjaci: {
    collectionHandle: "stolnjaci",
    tags: [],
    priority: 50,
  },
  krpe: {
    collectionHandle: "kuhinjske-krpe",
    tags: [],
    priority: 50,
  },
  kecelje: {
    collectionHandle: "kecelje",
    tags: [],
    priority: 50,
  },

  // Dnevna soba
  "ukrasne-jastucnice": {
    collectionHandle: "dekorativni-tekstil",
    tags: ["filter:ukrasne-jastucnice"],
    priority: 50,
  },
  "prekrivaci-tdf": {
    collectionHandle: "dekorativni-tekstil",
    tags: ["filter:dekorativni-prekrivaci"],
    priority: 50,
  },

  // Dečiji — leaf categories under room deciji-program
  "decija-cebad": {
    collectionHandle: "decija-cebad",
    tags: ["filter:cebad"],
    priority: 70,
  },
  "deciji-jastuci": {
    collectionHandle: "deciji-jastuci",
    tags: ["filter:jastuci"],
    priority: 70,
  },
  "decije-jastucnice": {
    collectionHandle: "deciji-jastuci",
    tags: ["filter:jastucnice"],
    priority: 70,
  },
  "decija-posteljina": {
    collectionHandle: "decija-posteljina",
    tags: ["filter:posteljina"],
    priority: 75,
  },
  "decije-posteljine": {
    collectionHandle: "decija-posteljina",
    tags: ["filter:posteljina"],
    priority: 75,
  },
  "deciji-peskiri": {
    collectionHandle: "deciji-peskiri",
    tags: [],
    priority: 70,
  },
  "deciji-program": {
    collectionHandle: "decija-posteljina",
    tags: [],
    priority: 20,
  },

  // Hotelski — wins over overlapping peškiri/posteljine leaves
  "hotelski-program": {
    collectionHandle: "hotelski-program",
    tags: [],
    priority: 90,
  },
  "ponuda-hotelskog-programa-viktorija": {
    collectionHandle: "hotelski-program",
    tags: [],
    priority: 95,
  },
};

function shopifyTagsFor(handle: string, extra: string[]): string[] {
  const group = COLLECTION_TO_GROUP[handle];
  const tags = new Set<string>([`niti:${handle}`, ...extra]);
  if (group) tags.add(`room:${group}`);
  return [...tags];
}

/** Title heuristics when Store API returns empty categories (e.g. pidžame). */
export function shouldExcludeByTitle(title: string): string | null {
  const t = title.toLowerCase();
  if (/pid[zž]am/.test(t)) return "excluded by title: pidžame";
  if (/spava[cć]ica|spavacica/.test(t)) return "excluded by title: spavaćice";
  if (/teksas\s*jakn|farmerice/.test(t)) return "excluded by title: apparel";
  return null;
}

export function resolveCategorySlugs(slugs: string[]): {
  outcome: "mapped" | "excluded" | "unmapped";
  collectionHandle?: string;
  tags: string[];
  matchedSlug?: string;
  excludeReason?: string;
  unmappedSlugs: string[];
} {
  const unique = [...new Set(slugs.filter(Boolean))];

  for (const slug of unique) {
    if (EXCLUDED_CATEGORY_SLUGS.has(slug)) {
      return {
        outcome: "excluded",
        tags: [],
        excludeReason: `excluded category: ${slug}`,
        unmappedSlugs: [],
      };
    }
  }

  const candidates = unique
    .filter((s) => CATEGORY_MAP[s] && !PARENT_CATEGORY_SLUGS.has(s))
    .map((s) => ({ slug: s, ...CATEGORY_MAP[s]! }));

  // Allow parent-only products that are mapped (deciji-program, hotelski)
  if (candidates.length === 0) {
    const parentMapped = unique
      .filter((s) => CATEGORY_MAP[s])
      .map((s) => ({ slug: s, ...CATEGORY_MAP[s]! }));
    if (parentMapped.length > 0) {
      parentMapped.sort((a, b) => b.priority - a.priority);
      const best = parentMapped[0]!;
      const tags = new Set<string>(shopifyTagsFor(best.collectionHandle, best.tags));
      for (const c of parentMapped) {
        for (const t of c.tags) tags.add(t);
      }
      return {
        outcome: "mapped",
        collectionHandle: best.collectionHandle,
        tags: [...tags],
        matchedSlug: best.slug,
        unmappedSlugs: [],
      };
    }

    const unmapped = unique.filter(
      (s) => !PARENT_CATEGORY_SLUGS.has(s) && !CATEGORY_MAP[s]
    );
    return {
      outcome: "unmapped",
      tags: [],
      unmappedSlugs: unmapped.length ? unmapped : unique,
    };
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const best = candidates[0]!;
  const tags = new Set<string>(shopifyTagsFor(best.collectionHandle, best.tags));
  for (const c of candidates) {
    for (const t of c.tags) tags.add(t);
  }

  return {
    outcome: "mapped",
    collectionHandle: best.collectionHandle,
    tags: [...tags],
    matchedSlug: best.slug,
    unmappedSlugs: [],
  };
}

/** Strip Viktorija branding for NITI storefront copy. */
export function rewriteBrandText(text: string): string {
  return text
    .replace(/\bViktorija\b/gi, "NITI.")
    .replace(/\bviktorija\b/g, "niti");
}

export function decodeBasicEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

export function cleanDescriptionHtml(html: string): string {
  if (!html) return "";
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<div[^>]*tinv[\s\S]*$/gi, "")
    .replace(/<a[^>]*tinvwl[\s\S]*?<\/a>/gi, "")
    .replace(/<[^>]*tinv[^>]*>[\s\S]*?<\/[^>]+>/gi, "")
    .replace(/Dodaj u listu želja/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br />")
    .replace(/\n{3,}/g, "\n\n");
  out = rewriteBrandText(out).trim();
  return out;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function rewriteTitle(title: string): string {
  // Prefer polishTitle from copy.ts in map pipeline; keep for backwards compat.
  return rewriteBrandText(decodeBasicEntities(title)).replace(/\s+/g, " ").trim();
}
