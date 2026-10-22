import {
  COLLECTION_DESCRIPTIONS,
  COLLECTION_TITLES,
  COLLECTION_TO_GROUP,
  GROUP_DESCRIPTIONS,
  GROUP_TITLES,
  htmlToPlainText,
} from "./category-map";
import type { CanonicalFile, CanonicalProduct } from "./types";

const PRODUCT_COLUMNS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Type",
  "Tags",
  "Published",
  "Published Scope",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Variant Barcode",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Status",
] as const;

const COLLECTION_COLUMNS = [
  "Handle",
  "Title",
  "Body HTML",
  "Published",
  "Published Scope",
  "Sort Order",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "SEO Title",
  "SEO Description",
  "Collection Rule: Column",
  "Collection Rule: Relation",
  "Collection Rule: Condition",
] as const;

function csvEscape(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row<T extends readonly string[]>(
  columns: T,
  values: Record<T[number], string | number | boolean>
): string {
  return columns.map((c) => csvEscape(values[c as T[number]])).join(",");
}

function emptyProduct(): Record<(typeof PRODUCT_COLUMNS)[number], string> {
  return Object.fromEntries(PRODUCT_COLUMNS.map((c) => [c, ""])) as Record<
    (typeof PRODUCT_COLUMNS)[number],
    string
  >;
}

function productRows(product: CanonicalProduct): string[] {
  const lines: string[] = [];
  const opt1 = product.options[0];
  const opt2 = product.options[1];
  const opt3 = product.options[2];
  const seo = htmlToPlainText(product.descriptionHtml).slice(0, 160);
  const variants =
    product.variants.length > 0
      ? product.variants
      : [
          {
            sku: "",
            price: 0,
            available: true,
            options: [{ name: "Title", value: "Default Title" }],
          },
        ];

  for (let vi = 0; vi < variants.length; vi++) {
    const variant = variants[vi]!;
    const r = emptyProduct();
    r.Handle = product.handle;

    if (vi === 0) {
      r.Title = product.title;
      r["Body (HTML)"] = product.descriptionHtml;
      r.Vendor = product.vendor;
      r.Type = product.productType;
      r.Tags = product.tags.join(", ");
      r.Published = product.published ? "TRUE" : "FALSE";
      r["Published Scope"] = "web";
      r["Option1 Name"] = opt1?.name ?? "Title";
      r["Option2 Name"] = opt2?.name ?? "";
      r["Option3 Name"] = opt3?.name ?? "";
      r["Gift Card"] = "FALSE";
      r["SEO Title"] = product.title;
      r["SEO Description"] = seo;
      r.Status = product.status;
      if (product.images[0]) {
        r["Image Src"] = product.images[0].src;
        r["Image Position"] = "1";
        r["Image Alt Text"] = product.images[0].alt || product.title;
      }
    }

    r["Option1 Value"] =
      variant.options[0]?.value ?? (opt1 ? "Standard" : "Default Title");
    r["Option2 Value"] = variant.options[1]?.value ?? "";
    r["Option3 Value"] = variant.options[2]?.value ?? "";
    r["Variant SKU"] = variant.sku;
    r["Variant Grams"] = "0";
    // Leave tracker empty so import does not invent fake inventory quantities
    r["Variant Inventory Tracker"] = "";
    r["Variant Inventory Qty"] = "";
    r["Variant Inventory Policy"] = "deny";
    r["Variant Fulfillment Service"] = "manual";
    r["Variant Price"] = variant.price;
    r["Variant Compare At Price"] = variant.compareAtPrice ?? "";
    r["Variant Requires Shipping"] = "TRUE";
    r["Variant Taxable"] = "TRUE";
    r["Variant Barcode"] = variant.barcode ?? "";

    lines.push(row(PRODUCT_COLUMNS, r));
  }

  for (let i = 1; i < product.images.length; i++) {
    const img = product.images[i]!;
    const extra = emptyProduct();
    extra.Handle = product.handle;
    extra["Image Src"] = img.src;
    extra["Image Position"] = String(i + 1);
    extra["Image Alt Text"] = img.alt || product.title;
    lines.push(row(PRODUCT_COLUMNS, extra));
  }

  return lines;
}

function collectionRow(opts: {
  handle: string;
  title: string;
  body: string;
  tag: string;
}): string {
  return row(COLLECTION_COLUMNS, {
    Handle: opts.handle,
    Title: opts.title,
    "Body HTML": `<p>${opts.body}</p>`,
    Published: "TRUE",
    "Published Scope": "web",
    "Sort Order": "best-selling",
    "Image Src": "",
    "Image Position": "",
    "Image Alt Text": "",
    "SEO Title": opts.title,
    "SEO Description": opts.body,
    "Collection Rule: Column": "tag",
    "Collection Rule: Relation": "equals",
    "Collection Rule: Condition": opts.tag,
  });
}

export function buildShopifyProductsCsv(canonical: CanonicalFile): string {
  const productLines = [PRODUCT_COLUMNS.join(",")];
  for (const product of canonical.products) {
    productLines.push(...productRows(product));
  }
  return productLines.join("\n") + "\n";
}

export function buildShopifyCollectionsCsv(): string {
  const lines = [COLLECTION_COLUMNS.join(",")];

  for (const [handle, title] of Object.entries(COLLECTION_TITLES)) {
    const body =
      COLLECTION_DESCRIPTIONS[handle] ??
      `${title} — NITI. asortiman.`;
    lines.push(
      collectionRow({
        handle,
        title,
        body,
        tag: `niti:${handle}`,
      })
    );
  }

  for (const [id, title] of Object.entries(GROUP_TITLES)) {
    lines.push(
      collectionRow({
        handle: id,
        title,
        body: GROUP_DESCRIPTIONS[id] ?? title,
        tag: `room:${id}`,
      })
    );
  }

  // Ensure every mapped collection has a room (already covered by GROUP_TITLES)
  void COLLECTION_TO_GROUP;

  return lines.join("\n") + "\n";
}
