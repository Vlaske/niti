import {
  categoryPathsToSlugs,
  cleanDescriptionHtml,
} from "./category-map";
import type { CanonicalSku } from "./types";

/** Strip XML tags / CDATA and decode a few entities. */
function textContent(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .trim();
}

function child(tag: string, block: string): string {
  const re = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );
  const m = block.match(re);
  return m ? textContent(m[1]!) : "";
}

function children(tag: string, block: string): string[] {
  const re = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "gi"
  );
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    out.push(textContent(m[1]!));
  }
  return out;
}

function findBlocks(xml: string): string[] {
  const candidates = [
    "product",
    "post",
    "item",
    "row",
    "node",
    "Proizvod",
  ];
  for (const tag of candidates) {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
    const blocks: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml))) {
      blocks.push(m[1]!);
    }
    if (blocks.length >= 2) return blocks;
  }

  // Fallback: sibling elements under root that look product-like
  const root = xml.replace(/^[\s\S]*?<[^?>]+>/, "").replace(/<\/[^>]+>\s*$/, "");
  const loose = [...root.matchAll(/<([A-Za-z0-9_-]+)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)];
  if (loose.length >= 2) {
    const names = new Map<string, number>();
    for (const m of loose) {
      names.set(m[1]!, (names.get(m[1]!) ?? 0) + 1);
    }
    let best = "";
    let bestCount = 0;
    for (const [name, count] of names) {
      if (count > bestCount) {
        best = name;
        bestCount = count;
      }
    }
    if (bestCount >= 2) {
      return loose.filter((m) => m[1] === best).map((m) => m[2]!);
    }
  }
  return [];
}

function parsePrice(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function gatherAttrs(block: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrBlocks = [
    ...block.matchAll(
      /<(?:attribute|atribut)(?:\s[^>]*)?>([\s\S]*?)<\/(?:attribute|atribut)>/gi
    ),
  ];
  for (const m of attrBlocks) {
    const inner = m[1]!;
    const name =
      child("name", inner) ||
      child("Name", inner) ||
      child("ime", inner);
    const value =
      child("value", inner) ||
      child("Value", inner) ||
      child("vrednost", inner);
    if (name && value) attrs[name] = value;
  }

  // Flat attribute tags often used by WP All Export
  const flat = [
    ["Boja", "Boja", "Color", "colour"],
    ["Dimenzija", "Dimenzija", "Size", "Dimension"],
    ["Veličina", "Velicina", "Veličina"],
    ["Barkod", "Barkod", "Barcode", "GTIN"],
    ["Sirovinski sastav", "Material", "Sastav"],
  ] as const;
  for (const [canon, ...aliases] of flat) {
    if (attrs[canon]) continue;
    for (const a of aliases) {
      const v = child(a, block);
      if (v) {
        attrs[canon] = v;
        break;
      }
    }
  }
  return attrs;
}

function toHtml(text: string): string {
  const cleaned = cleanDescriptionHtml(text);
  if (!cleaned) return "";
  if (/<[a-z][\s\S]*>/i.test(cleaned)) return cleaned;
  return `<p>${cleaned.replace(/\n/g, "<br />")}</p>`;
}

/**
 * Parse WP All Export (or similar) WooCommerce XML into CanonicalSku[].
 * Field names vary by export template — we accept common aliases.
 */
export function parseWooXml(xml: string): CanonicalSku[] {
  const blocks = findBlocks(xml);
  if (!blocks.length) {
    throw new Error(
      "XML parser found no repeating product nodes. Check the feed structure or use CSV."
    );
  }

  const skus: CanonicalSku[] = [];
  for (const block of blocks) {
    const sku =
      child("SKU", block) ||
      child("sku", block) ||
      child("Šifra proizvoda", block) ||
      child("sifra", block) ||
      child("_sku", block);
    const title =
      child("Title", block) ||
      child("title", block) ||
      child("Ime", block) ||
      child("Name", block) ||
      child("post_title", block);
    if (!sku && !title) continue;

    const idRaw =
      child("ID", block) ||
      child("id", block) ||
      child("ProductId", block) ||
      child("post_id", block);
    const sourceId = Number(idRaw) || 0;

    const catsRaw =
      child("Categories", block) ||
      child("Kategorije", block) ||
      child("ProductCategories", block) ||
      children("category", block).join(", ") ||
      children("Category", block).join(", ");
    const { slugs, paths } = categoryPathsToSlugs(catsRaw);

    const attrs = gatherAttrs(block);
    const price = parsePrice(
      child("RegularPrice", block) ||
        child("regular_price", block) ||
        child("Price", block) ||
        child("price", block) ||
        child("Redovna cena", block)
    );
    const sale = parsePrice(
      child("SalePrice", block) ||
        child("sale_price", block) ||
        child("Cena na sniženju", block)
    );

    const images = [
      ...children("Image", block),
      ...children("ImageURL", block),
      ...children("image", block),
      ...(child("Images", block) || child("Slike", block) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ].filter((u) => /^https?:\/\//i.test(u));

    const desc =
      child("Content", block) ||
      child("Description", block) ||
      child("Opis", block) ||
      child("content", block) ||
      child("post_content", block);

    const short =
      child("Excerpt", block) ||
      child("ShortDescription", block) ||
      child("Kratak opis", block);

    const publishedRaw =
      child("Published", block) ||
      child("Objavljeno", block) ||
      child("Status", block) ||
      "1";

    skus.push({
      sourceId,
      sku: sku || `woo-${sourceId}`,
      barcode:
        attrs.Barkod ||
        child("Barcode", block) ||
        child("GTIN", block) ||
        undefined,
      title,
      descriptionHtml: toHtml(desc || short),
      shortDescription: short || undefined,
      price: sale > 0 && sale < price ? sale : price,
      compareAtPrice: sale > 0 && sale < price ? price : undefined,
      available: !/outofstock|0|false/i.test(
        child("StockStatus", block) || child("InStock", block) || "instock"
      ),
      categorySlugs: slugs,
      categoryPaths: paths,
      attributes: attrs,
      imageUrls: [...new Set(images)],
      sourceUrl:
        child("Permalink", block) ||
        child("URL", block) ||
        child("Link", block) ||
        undefined,
      published:
        publishedRaw === "1" ||
        /publish|true|yes/i.test(publishedRaw),
      source: "xml",
    });
  }

  return skus;
}
