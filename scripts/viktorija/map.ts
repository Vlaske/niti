import fs from "node:fs/promises";
import path from "node:path";
import {
  COLLECTION_TITLES,
  resolveCategorySlugs,
  shouldExcludeByTitle,
} from "./category-map";
import {
  canGroupByBaseTitle,
  extractFacets,
  groupingKey,
  polishDescriptionHtml,
  polishTitle,
  slugifyHandle,
  type ProductFacets,
} from "./copy";
import {
  CANONICAL_FILE,
  DATA_DIR,
  RAW_DIR,
  UNMAPPED_FILE,
} from "./paths";
import type {
  CanonicalFile,
  CanonicalProduct,
  CanonicalVariant,
  RawProductFile,
  UnmappedReport,
  WcStoreProduct,
} from "./types";

const MAX_VARIANTS = 100;

function parseMoney(amount: string, minorUnit: number): number {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  return minorUnit > 0 ? n / 10 ** minorUnit : n;
}

function attrMap(product: WcStoreProduct): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of product.attributes ?? []) {
    const values = (attr.terms ?? []).map((t) => t.name).filter(Boolean);
    if (values.length) out[attr.name] = values.join(", ");
  }
  return out;
}

type DraftProduct = CanonicalProduct & { facets: ProductFacets };

function toDraft(product: WcStoreProduct): {
  product?: DraftProduct;
  excluded?: { id: number; handle: string; reason: string };
  unmappedSlugs?: string[];
} {
  const sourceCategorySlugs = (product.categories ?? []).map((c) => c.slug);
  const titleExclude = shouldExcludeByTitle(product.name);
  if (titleExclude) {
    return {
      excluded: {
        id: product.id,
        handle: product.slug,
        reason: titleExclude,
      },
    };
  }

  const resolved = resolveCategorySlugs(sourceCategorySlugs);
  if (resolved.outcome === "excluded") {
    return {
      excluded: {
        id: product.id,
        handle: product.slug,
        reason: resolved.excludeReason ?? "excluded",
      },
    };
  }
  if (resolved.outcome === "unmapped" || !resolved.collectionHandle) {
    return {
      unmappedSlugs: resolved.unmappedSlugs.length
        ? resolved.unmappedSlugs
        : ["(no-category)"],
    };
  }

  const attributes = attrMap(product);
  const facets = extractFacets(product.name, attributes);
  const displayTitle = polishTitle(facets.baseTitle || product.name);

  const minor = product.prices?.currency_minor_unit ?? 0;
  const price = parseMoney(product.prices?.price ?? "0", minor);
  const regular = parseMoney(product.prices?.regular_price ?? "0", minor);
  const compareAt =
    product.on_sale && regular > price ? regular : undefined;

  const optionPairs: { name: string; value: string }[] = [];
  if (facets.dimenzija) optionPairs.push({ name: "Dimenzija", value: facets.dimenzija });
  if (facets.velicina) optionPairs.push({ name: "Veličina", value: facets.velicina });
  if (facets.boja) optionPairs.push({ name: "Boja", value: facets.boja });
  if (facets.dezen) optionPairs.push({ name: "Dezen", value: facets.dezen });

  const needsReview: string[] = [];
  if (product.type === "variable" || product.has_options) {
    needsReview.push("source-variable-product");
  }

  const material = attributes["Sirovinski sastav"]?.split(",")[0]?.trim();
  const descriptionHtml = polishDescriptionHtml(
    product.description || product.short_description || "",
    { title: displayTitle, material }
  );

  const tags = new Set(resolved.tags);
  if (product.on_sale) tags.add("sale");
  if (material) {
    tags.add(
      `material:${material
        .toLowerCase()
        .replace(/%/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 40)}`
    );
  }

  const images = (product.images ?? []).map((img) => ({
    src: img.src,
    alt: img.alt || displayTitle,
  }));
  if (!images.length) needsReview.push("missing-images");
  if (!price) needsReview.push("missing-price");

  const options =
    optionPairs.length > 0
      ? optionPairs.map((o) => ({ name: o.name, values: [o.value] }))
      : [{ name: "Title", values: ["Default Title"] }];

  const variants: CanonicalVariant[] = [
    {
      sku: product.sku || `vik-${product.id}`,
      price,
      compareAtPrice: compareAt,
      available: Boolean(product.is_in_stock),
      options:
        optionPairs.length > 0
          ? optionPairs
          : [{ name: "Title", value: "Default Title" }],
    },
  ];

  return {
    product: {
      sourceId: product.id,
      sourceUrl: product.permalink,
      handle: product.slug,
      title: displayTitle,
      descriptionHtml,
      vendor: "NITI.",
      productType:
        COLLECTION_TITLES[resolved.collectionHandle] ??
        resolved.collectionHandle,
      collectionHandle: resolved.collectionHandle,
      tags: [...tags].sort(),
      sourceCategorySlugs,
      images,
      options,
      variants,
      attributes,
      published: true,
      status: "active",
      needsReview: needsReview.length ? needsReview : undefined,
      facets,
    },
  };
}

function mergeGroup(drafts: DraftProduct[]): CanonicalProduct {
  const primary = drafts[0]!;
  const baseTitle = polishTitle(primary.facets.baseTitle || primary.title);

  // Axes that actually vary (or exist) across the group — max 3 for Shopify
  const axisNames = ["Dimenzija", "Veličina", "Boja", "Dezen"] as const;
  const axisValues = new Map<string, Set<string>>();
  for (const name of axisNames) axisValues.set(name, new Set());

  for (const d of drafts) {
    if (d.facets.dimenzija) axisValues.get("Dimenzija")!.add(d.facets.dimenzija);
    if (d.facets.velicina) axisValues.get("Veličina")!.add(d.facets.velicina);
    if (d.facets.boja) axisValues.get("Boja")!.add(d.facets.boja);
    if (d.facets.dezen) axisValues.get("Dezen")!.add(d.facets.dezen);
  }

  const activeAxes = axisNames
    .filter((name) => {
      const set = axisValues.get(name)!;
      return set.size > 1 || (drafts.length === 1 && set.size === 1);
    })
    .slice(0, 3);

  // Multi-item groups: keep axes with ≥1 value if at least one axis varies
  let axes = activeAxes;
  if (drafts.length > 1) {
    const varying = axisNames.filter((n) => (axisValues.get(n)?.size ?? 0) > 1);
    axes = (varying.length ? varying : activeAxes).slice(0, 3);
  }

  if (axes.length === 0) {
    axes = [];
  }

  const options =
    axes.length > 0
      ? axes.map((name) => ({
          name,
          values: [...(axisValues.get(name) ?? [])].sort(),
        }))
      : [{ name: "Title", values: ["Default Title"] }];

  const variants: CanonicalVariant[] = [];
  const images: CanonicalProduct["images"] = [];
  const seenImg = new Set<string>();
  const tags = new Set<string>();
  const needsReview = new Set<string>();

  for (const d of drafts) {
    for (const t of d.tags) tags.add(t);
    for (const r of d.needsReview ?? []) needsReview.add(r);
    for (const img of d.images) {
      if (seenImg.has(img.src)) continue;
      seenImg.add(img.src);
      images.push({ ...img, alt: img.alt || baseTitle });
    }

    const facetMap: Record<string, string | undefined> = {
      Dimenzija: d.facets.dimenzija,
      Veličina: d.facets.velicina,
      Boja: d.facets.boja,
      Dezen: d.facets.dezen,
    };

    const variantOpts =
      axes.length > 0
        ? axes.map((name) => ({
            name,
            value: facetMap[name] || "Standard",
          }))
        : [{ name: "Title", value: "Default Title" }];

    const v = d.variants[0]!;
    variants.push({
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      available: v.available,
      options: variantOpts,
    });
  }

  // Deduplicate identical option combinations (keep first)
  const seenCombo = new Set<string>();
  const uniqueVariants = variants.filter((v) => {
    const key = v.options.map((o) => o.value).join("|");
    if (seenCombo.has(key)) return false;
    seenCombo.add(key);
    return true;
  });

  let finalVariants = uniqueVariants;
  if (finalVariants.length > MAX_VARIANTS) {
    needsReview.add("truncated-variants");
    finalVariants = finalVariants.slice(0, MAX_VARIANTS);
  }

  // Rebuild option value lists from final variants
  const finalOptions =
    axes.length > 0
      ? axes.map((name) => ({
          name,
          values: [
            ...new Set(
              finalVariants
                .map((v) => v.options.find((o) => o.name === name)?.value)
                .filter(Boolean) as string[]
            ),
          ].sort(),
        }))
      : [{ name: "Title", values: ["Default Title"] }];

  const handle = slugifyHandle(baseTitle, primary.collectionHandle);
  const longestDesc = drafts
    .map((d) => d.descriptionHtml)
    .sort((a, b) => b.length - a.length)[0]!;

  return {
    sourceId: primary.sourceId,
    sourceUrl: primary.sourceUrl,
    handle,
    title: baseTitle,
    descriptionHtml: polishDescriptionHtml(longestDesc, { title: baseTitle }),
    vendor: "NITI.",
    productType: primary.productType,
    collectionHandle: primary.collectionHandle,
    tags: [...tags].sort(),
    sourceCategorySlugs: [
      ...new Set(drafts.flatMap((d) => d.sourceCategorySlugs)),
    ],
    images,
    options: finalOptions,
    variants: finalVariants,
    attributes: primary.attributes,
    published: true,
    status: "active",
    needsReview: needsReview.size ? [...needsReview] : undefined,
  };
}

function groupDrafts(drafts: DraftProduct[]): CanonicalProduct[] {
  const buckets = new Map<string, DraftProduct[]>();
  for (const d of drafts) {
    const base = d.facets.baseTitle || d.title;
    // Generic names stay as individual SKUs (still polished + option-aware)
    const key = canGroupByBaseTitle(base)
      ? groupingKey(d.collectionHandle, base)
      : `solo::${d.sourceId}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  const products: CanonicalProduct[] = [];
  const usedHandles = new Set<string>();

  for (const group of buckets.values()) {
    // Only merge when ≥2 share a differentiating facet; otherwise keep separate
    // if bases collided incorrectly
    let merged = mergeGroup(group);

    if (group.length > 1) {
      const varying =
        merged.options.length > 0 &&
        merged.options.some((o) => o.name !== "Title" && o.values.length > 1);
      if (!varying) {
        // False merge — emit separately with polished individual titles
        for (const d of group) {
          const solo = mergeGroup([d]);
          solo.title = polishTitle(d.facets.baseTitle || d.title);
          let h = solo.handle;
          let n = 2;
          while (usedHandles.has(h)) {
            h = `${solo.handle}-${n++}`;
          }
          solo.handle = h;
          usedHandles.add(h);
          products.push(solo);
        }
        continue;
      }
    }

    let h = merged.handle;
    let n = 2;
    while (usedHandles.has(h)) {
      h = `${merged.handle}-${n++}`;
    }
    merged.handle = h;
    usedHandles.add(h);
    products.push(merged);
  }

  return products;
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const files = (await fs.readdir(RAW_DIR)).filter((f) => f.endsWith(".json"));
  if (!files.length) {
    console.error(`No raw products in ${RAW_DIR}. Run scrape first.`);
    process.exit(1);
  }

  console.log(`Mapping ${files.length} raw products…`);

  const drafts: DraftProduct[] = [];
  const excluded: UnmappedReport["excluded"] = [];
  const unmappedCatCounts = new Map<
    string,
    { count: number; samples: number[] }
  >();
  let skippedUnmapped = 0;

  for (const file of files) {
    const raw = JSON.parse(
      await fs.readFile(path.join(RAW_DIR, file), "utf8")
    ) as RawProductFile;
    const result = toDraft(raw.product);

    if (result.excluded) {
      excluded.push(result.excluded);
      continue;
    }
    if (result.unmappedSlugs) {
      skippedUnmapped += 1;
      for (const slug of result.unmappedSlugs) {
        const entry = unmappedCatCounts.get(slug) ?? {
          count: 0,
          samples: [],
        };
        entry.count += 1;
        if (entry.samples.length < 5) entry.samples.push(raw.product.id);
        unmappedCatCounts.set(slug, entry);
      }
      continue;
    }
    if (result.product) drafts.push(result.product);
  }

  const products = groupDrafts(drafts).sort((a, b) =>
    a.handle.localeCompare(b.handle)
  );

  const collectionCounts: Record<string, number> = {};
  const needsReview: UnmappedReport["needsReview"] = [];
  let variantCount = 0;
  for (const p of products) {
    collectionCounts[p.collectionHandle] =
      (collectionCounts[p.collectionHandle] ?? 0) + 1;
    variantCount += p.variants.length;
    if (p.needsReview?.length) {
      needsReview.push({
        id: p.sourceId,
        handle: p.handle,
        reasons: p.needsReview,
      });
    }
  }

  const canonical: CanonicalFile = {
    mappedAt: new Date().toISOString(),
    productCount: products.length,
    skippedCount: excluded.length + skippedUnmapped,
    products,
  };

  const report: UnmappedReport = {
    mappedAt: canonical.mappedAt,
    excluded,
    unmappedCategories: [...unmappedCatCounts.entries()]
      .map(([slug, v]) => ({
        slug,
        productCount: v.count,
        sampleProductIds: v.samples,
      }))
      .sort((a, b) => b.productCount - a.productCount),
    needsReview,
    collectionCounts,
  };

  await fs.writeFile(CANONICAL_FILE, JSON.stringify(canonical, null, 2), "utf8");
  await fs.writeFile(UNMAPPED_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log(
    `Mapped ${drafts.length} SKUs → ${products.length} Shopify products (${variantCount} variants)`
  );
  console.log(
    `Skipped excluded=${excluded.length} unmapped=${skippedUnmapped}`
  );
  console.log(`Collection counts:`, collectionCounts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
