/**
 * Professional Serbian product copy + facet extraction for Shopify variants.
 * Used by map.ts so future re-scrapes stay consistent.
 */

import { decodeBasicEntities, rewriteBrandText } from "./category-map";

const SMALL_WORDS = new Set([
  "i",
  "a",
  "u",
  "na",
  "sa",
  "za",
  "od",
  "do",
  "po",
  "te",
  "ili",
  "kao",
  "bez",
  "pri",
  "pre",
  "nad",
  "pod",
]);

const PHRASE_FIXES: [RegExp, string][] = [
  [/\bbade\s*mantil\b/gi, "Bade mantil"],
  [/\bpe[sš]kir\b/gi, "Peškir"],
  [/\b[cč]ar[sš]av\b/gi, "Čaršav"],
  [/\bposteljina\b/gi, "Posteljina"],
  [/\bposteljine\b/gi, "Posteljine"],
  [/\bjorgan\b/gi, "Jorgan"],
  [/\bprekriva[cč]\b/gi, "Prekrivač"],
  [/\b[cć]ebe\b/gi, "Ćebe"],
  [/\b[cć]ebad\b/gi, "Ćebad"],
  [/\bjastuk\b/gi, "Jastuk"],
  [/\bjastu[cč]nica\b/gi, "Jastučnica"],
  [/\bstolnjak\b/gi, "Stolnjak"],
  [/\bkecelja\b/gi, "Kecelja"],
  [/\bprostirka\b/gi, "Prostirka"],
  [/\bnaddu[sš]ek\b/gi, "Naddušek"],
  [/\bkomplet\s+set\s+posteljina\b/gi, "Komplet posteljine"],
  [/\bkomplet\s+posteljina\b/gi, "Komplet posteljine"],
  [/\bset\s+od\s+(\d+)\s+kuhinjskih\s+krpa\b/gi, "Set od $1 kuhinjskih krpa"],
  [/\bnarandzast/gi, "narandžast"],
  [/\bljubicast/gi, "ljubičast"],
  [/\bg\/m2\b/gi, "g/m²"],
  [/g\/m2\b/gi, "g/m²"],
  [/\bkids\b/gi, "Kids"],
  [/\bhotel\b/gi, "Hotel"],
  [/\bpamuk\b/gi, "pamuk"],
  [/\bfrotir\b/gi, "frotir"],
  [/\bflanel\b/gi, "flanel"],
  [/\bpuplin\b/gi, "puplin"],
  [/\bdamast\b/gi, "damast"],
  [/\bmemorijska\s+prostirka\b/gi, "memorijska prostirka"],
  [/\bnepromo[cč]ivi\b/gi, "Nepromočivi"],
];

export type ProductFacets = {
  /** Parent title without size / dimension / color / design code */
  baseTitle: string;
  dimenzija?: string;
  velicina?: string;
  boja?: string;
  dezen?: string;
};

function applyPhraseFixes(text: string): string {
  let out = text;
  for (const [re, rep] of PHRASE_FIXES) {
    out = out.replace(re, rep);
  }
  return out;
}

/** Title Case for Serbian product names — consistent, professional. */
export function titleCaseSr(input: string): string {
  const cleaned = input.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;

  return cleaned
    .split(" ")
    .map((raw, i) => {
      if (!raw) return raw;
      // Keep codes / sizes
      if (/^(?:XXXL|XXL|XL|[SML]|D\d+)$/i.test(raw)) return raw.toUpperCase().replace(/^D/, "D");
      if (/^\d/.test(raw)) return raw;
      if (raw === "NITI." || raw.toLowerCase() === "niti.") return "NITI.";
      if (raw.includes("/")) return raw; // 400g/m² already fixed
      if (raw.includes("×") || raw.includes("x")) return raw;

      const lower = raw.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;

      // Preserve hyphenated parts
      return lower
        .split("-")
        .map((part) =>
          part ? part.charAt(0).toUpperCase() + part.slice(1) : part
        )
        .join("-");
    })
    .join(" ")
    .replace(/\bBade Mantil\b/g, "Bade mantil")
    .replace(/\bPeškir\b/g, "Peškir");
}

export function polishTitle(raw: string): string {
  let t = rewriteBrandText(decodeBasicEntities(raw));
  t = t.replace(/\s*[–—]\s*/g, " – ");
  t = t.replace(/\s+/g, " ").trim();
  t = applyPhraseFixes(t);
  return titleCaseSr(t);
}

function normalizeDim(raw: string): string {
  return raw
    .replace(/×/g, "x")
    .replace(/\s+/g, "")
    .replace(/cm$/i, "")
    .toLowerCase();
}

function formatDim(raw: string): string {
  const m = raw
    .replace(/×/g, "x")
    .match(
      /(\d+)\s*x\s*(\d+)(?:\s*x\s*(\d+))?(?:\s*\/\s*(\d+))?\s*(cm)?/i
    );
  if (!m) return raw.replace(/\s+/g, " ").trim();
  let out = `${m[1]} × ${m[2]}`;
  if (m[3]) out += ` × ${m[3]}`;
  if (m[4]) out += ` / ${m[4]}`;
  out += " cm";
  return out;
}

function formatSize(raw: string): string {
  const m = raw.toUpperCase().match(/\b(XXXL|XXL|XL|L|M|S)\b/);
  return m ? m[1] : raw.trim();
}

function formatDezen(raw: string): string {
  const d = raw.match(/\bD\s*(\d+)\b/i);
  if (d) return `D${d[1]}`;
  const n = raw.match(/dezen\s*(?:broj\s*)?(\d+)/i);
  if (n) return `Dezen ${n[1]}`;
  return raw.trim();
}

/**
 * Split a scraped title into a clean parent name + variant facets.
 * Attributes win when present.
 */
export function extractFacets(
  rawTitle: string,
  attributes: Record<string, string>
): ProductFacets {
  let working = rewriteBrandText(decodeBasicEntities(rawTitle));
  working = working.replace(/\s+/g, " ").trim();

  let dimenzija: string | undefined;
  let velicina: string | undefined;
  let boja: string | undefined;
  let dezen: string | undefined;

  if (attributes.Dimenzija) {
    dimenzija = formatDim(attributes.Dimenzija.split(",")[0]!.trim());
  }
  if (attributes.Veličina || attributes.Velicina) {
    velicina = formatSize(
      (attributes.Veličina || attributes.Velicina || "").split(",")[0]!.trim()
    );
  }
  if (attributes.Boja) {
    const b = attributes.Boja.split(",")[0]!.trim();
    if (b && !/^n\/a|bez|default/i.test(b)) {
      boja = titleCaseSr(b.replace(/\s+boja$/i, "").trim());
    }
  }

  // Title: dimension
  if (!dimenzija) {
    const dm = working.match(
      /(\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?(?:\s*\/\s*\d+)?\s*(?:cm)?)/i
    );
    if (dm) {
      dimenzija = formatDim(dm[1]!);
      working = working.replace(dm[0]!, " ");
    }
  } else {
    working = working.replace(
      /\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?(?:\s*\/\s*\d+)?\s*(?:cm)?/gi,
      " "
    );
  }

  // Title: size / veličina
  const sizeRe =
    /\b(?:veli[cč]ina\s*[:\-]?\s*)?(XXXL|XXL|XL|L|M|S)(?:\s*[:\-]?\s*veli[cč]ina)?\b/gi;
  if (!velicina) {
    const sm = working.match(sizeRe);
    if (sm) {
      velicina = formatSize(sm[0]!);
      working = working.replace(sizeRe, " ");
    }
  } else {
    working = working.replace(sizeRe, " ");
  }

  // Title: design code
  const dezenRe = /\b(?:dezen\s*(?:broj\s*)?\d+|D\s*\d+)\b/gi;
  if (!dezen) {
    const dz = working.match(dezenRe);
    if (dz) {
      dezen = formatDezen(dz[0]!);
      working = working.replace(dezenRe, " ");
    }
  } else {
    working = working.replace(dezenRe, " ");
  }

  // Trailing color phrase "… Roze boja" / "… Light Blue"
  if (!boja) {
    const colorTail = working.match(
      /\s+((?:Light|Dark|Prljavo|Tamno)?\s*[A-Za-zĆćČčŠšŽžĐđ]+(?:\s+[A-Za-zĆćČčŠšŽžĐđ]+)?)\s*boja\s*$/i
    );
    if (colorTail) {
      boja = titleCaseSr(colorTail[1]!.trim());
      working = working.slice(0, colorTail.index).trim();
    }
  } else {
    working = working.replace(/\s+\S+(?:\s+\S+)?\s*boja\s*$/i, " ");
  }

  working = working
    .replace(/\bveli[cč]ina\b/gi, " ")
    .replace(/\s*boja\s*$/i, " ")
    .replace(/\s*[–—|]+\s*/g, " – ")
    .replace(/\s*–\s*$/g, "")
    .replace(/^\s*–\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  working = applyPhraseFixes(working);
  let baseTitle = titleCaseSr(working);

  // If stripping left only a generic type word, fall back to a fuller polished title
  // (still without raw dimension strings) so we do not merge unrelated SKUs.
  if (isGenericProductName(baseTitle)) {
    let fallback = rewriteBrandText(decodeBasicEntities(rawTitle));
    fallback = fallback
      .replace(/\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?(?:\s*\/\s*\d+)?\s*(?:cm)?/gi, " ")
      .replace(sizeRe, " ")
      .replace(/\bveli[cč]ina\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    fallback = applyPhraseFixes(fallback);
    baseTitle = titleCaseSr(fallback);
    if (isGenericProductName(baseTitle)) {
      baseTitle = polishTitle(rawTitle);
    }
  }

  return { baseTitle, dimenzija, velicina, boja, dezen };
}

const GENERIC_NAMES = new Set([
  "peskir",
  "carsav",
  "stolnjak",
  "kecelja",
  "jastuk",
  "jastucnica",
  "cebe",
  "cebad",
  "jorgan",
  "prekrivac",
  "prostirka",
  "bade mantil",
  "posteljina",
  "posteljine",
  "komplet",
  "set",
]);

export function isGenericProductName(title: string): boolean {
  const norm = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!norm) return true;
  const words = norm.split(" ");
  if (words.length <= 1) return true;
  if (GENERIC_NAMES.has(norm)) return true;
  // "Bade mantil Frotir" is still weak alone for merging hundreds of robes
  if (norm === "bade mantil frotir") return true;
  return false;
}

/** Only merge SKUs when the parent name is specific enough. */
export function canGroupByBaseTitle(baseTitle: string): boolean {
  return !isGenericProductName(baseTitle);
}

export function groupingKey(
  collectionHandle: string,
  baseTitle: string
): string {
  const norm = baseTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${collectionHandle}::${norm}`;
}

export function slugifyHandle(baseTitle: string, collectionHandle: string): string {
  const slug = baseTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return slug || collectionHandle;
}

export function polishDescriptionHtml(
  html: string,
  opts: { title: string; material?: string }
): string {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<div[^>]*tinv[\s\S]*$/gi, "")
    .replace(/<a[^>]*tinvwl[\s\S]*?<\/a>/gi, "")
    .replace(/Dodaj u listu želja/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br />");

  out = rewriteBrandText(out).trim();

  // Drop leading paragraph that only repeats the title
  const titleNorm = opts.title.toLowerCase().replace(/\s+/g, " ").trim();
  out = out.replace(/<p>([\s\S]*?)<\/p>/i, (full, inner) => {
    const plain = String(inner)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (plain === titleNorm || plain.length < 8) return "";
    return full;
  });

  out = out.replace(/<p>\s*<\/p>/gi, "").trim();

  if (out.length < 40 && opts.material) {
    out += `<p>Sastav: ${opts.material}.</p>`;
  }

  if (!out) {
    out = `<p>${opts.title} — kvalitetan kućni tekstil iz NITI. asortimana.</p>`;
  }

  return out.trim();
}

export { normalizeDim, formatDim };
