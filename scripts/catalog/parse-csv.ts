import {
  categoryPathsToSlugs,
  cleanDescriptionHtml,
} from "./category-map";
import { parseCsv, rowsToObjects } from "./csv-util";
import type { CanonicalSku } from "./types";

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") return row[key]!;
  }
  // Case-insensitive fallback
  const lower = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])
  );
  for (const key of keys) {
    const v = lower[key.toLowerCase()];
    if (v) return v;
  }
  return "";
}

function parsePrice(raw: string): number {
  if (!raw) return 0;
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function parseAttrs(row: Record<string, string>): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (let i = 1; i <= 10; i++) {
    const name = pick(row, `Ime ${i} atributa`, `Attribute ${i} name`);
    const value = pick(
      row,
      `Atribut ${i} vrednost(i)`,
      `Attribute ${i} value(s)`
    );
    if (name && value) attrs[name] = value;
  }
  return attrs;
}

function imageUrls(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u));
}

function toHtml(text: string): string {
  const cleaned = cleanDescriptionHtml(text);
  if (!cleaned) return "";
  if (/<[a-z][\s\S]*>/i.test(cleaned)) return cleaned;
  return cleaned
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function parseWooCsv(text: string): CanonicalSku[] {
  const rows = rowsToObjects(parseCsv(text));
  const skus: CanonicalSku[] = [];

  for (const row of rows) {
    const sku = pick(row, "Šifra proizvoda", "SKU", "Sku");
    const idRaw = pick(row, "ID", "Id");
    const title = pick(row, "Ime", "Name", "Title");
    if (!sku && !title) continue;

    const sourceId = Number(idRaw) || 0;
    const cats = pick(row, "Kategorije", "Categories");
    const { slugs, paths } = categoryPathsToSlugs(cats);
    const attrs = parseAttrs(row);
    const barcode =
      attrs.Barkod ||
      pick(row, "GTIN, UPC, EAN ili ISBN", "GTIN") ||
      undefined;

    const price = parsePrice(pick(row, "Redovna cena", "Regular price"));
    const sale = parsePrice(pick(row, "Cena na sniženju", "Sale price"));
    const publishedRaw = pick(row, "Objavljeno", "Published");
    const published = publishedRaw === "1" || publishedRaw.toLowerCase() === "yes";

    const desc =
      pick(row, "Opis", "Description") ||
      pick(row, "Kratak opis", "Short description");

    skus.push({
      sourceId,
      sku: sku || `woo-${sourceId}`,
      barcode: barcode || undefined,
      title,
      descriptionHtml: toHtml(desc),
      shortDescription: pick(row, "Kratak opis", "Short description") || undefined,
      price: sale > 0 && sale < price ? sale : price,
      compareAtPrice: sale > 0 && sale < price ? price : undefined,
      available: pick(row, "Na zalihama?", "In stock?") !== "0",
      categorySlugs: slugs,
      categoryPaths: paths,
      attributes: attrs,
      imageUrls: imageUrls(pick(row, "Slike", "Images")),
      published,
      source: "csv",
    });
  }

  return skus;
}
