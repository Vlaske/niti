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
import type {
  CanonicalProduct,
  CanonicalSku,
  CanonicalVariant,
  UnmappedReport,
} from "./types";

const MAX_VARIANTS = 100;

type DraftProduct = CanonicalProduct & { facets: ProductFacets };

function toDraft(sku: CanonicalSku): {
  product?: DraftProduct;
  excluded?: UnmappedReport["excluded"][number];
  unmappedSlugs?: string[];
} {
  const titleExclude = shouldExcludeByTitle(sku.title);
  if (titleExclude) {
    return {
      excluded: {
        id: sku.sourceId,
        sku: sku.sku,
        handle: sku.sku.toLowerCase(),
        reason: titleExclude,
      },
    };
  }

  const resolved = resolveCategorySlugs(sku.categorySlugs);
  if (resolved.outcome === "excluded") {
    return {
      excluded: {
        id: sku.sourceId,
        sku: sku.sku,
        handle: sku.sku.toLowerCase(),
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

  const facets = extractFacets(sku.title, sku.attributes);
  const displayTitle = polishTitle(facets.baseTitle || sku.title);

  const optionPairs: { name: string; value: string }[] = [];
  if (facets.dimenzija)
    optionPairs.push({ name: "Dimenzija", value: facets.dimenzija });
  if (facets.velicina)
    optionPairs.push({ name: "Veličina", value: facets.velicina });
  if (facets.boja) optionPairs.push({ name: "Boja", value: facets.boja });
  if (facets.dezen) optionPairs.push({ name: "Dezen", value: facets.dezen });

  const needsReview: string[] = [];
  const material = sku.attributes["Sirovinski sastav"]?.split(",")[0]?.trim();
  const descriptionHtml = polishDescriptionHtml(sku.descriptionHtml || "", {
    title: displayTitle,
    material,
  });

  const tags = new Set(resolved.tags);
  if (sku.compareAtPrice && sku.compareAtPrice > sku.price) tags.add("sale");
  if (material) {
    tags.add(
      `material:${material
        .toLowerCase()
        .replace(/%/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 40)}`
    );
  }

  const images = sku.imageUrls.map((src) => ({
    src,
    alt: displayTitle,
  }));
  if (!images.length) needsReview.push("missing-images");
  if (!sku.price) needsReview.push("missing-price");
  if (!sku.sku) needsReview.push("missing-sku");

  const options =
    optionPairs.length > 0
      ? optionPairs.map((o) => ({ name: o.name, values: [o.value] }))
      : [{ name: "Title", values: ["Default Title"] }];

  const variants: CanonicalVariant[] = [
    {
      sku: sku.sku,
      barcode: sku.barcode,
      sourceWooId: sku.sourceId || undefined,
      price: sku.price,
      compareAtPrice: sku.compareAtPrice,
      available: sku.available,
      options:
        optionPairs.length > 0
          ? optionPairs
          : [{ name: "Title", value: "Default Title" }],
      image: images[0]?.src,
    },
  ];

  return {
    product: {
      sourceId: sku.sourceId,
      sourceUrl: sku.sourceUrl,
      handle: slugifyHandle(displayTitle, resolved.collectionHandle),
      title: displayTitle,
      descriptionHtml,
      vendor: "NITI.",
      productType:
        COLLECTION_TITLES[resolved.collectionHandle] ??
        resolved.collectionHandle,
      collectionHandle: resolved.collectionHandle,
      tags: [...tags].sort(),
      sourceCategorySlugs: sku.categorySlugs,
      images,
      options,
      variants,
      attributes: sku.attributes,
      published: sku.published,
      status: sku.published ? "active" : "draft",
      needsReview: needsReview.length ? needsReview : undefined,
      facets,
    },
  };
}

function mergeGroup(drafts: DraftProduct[]): CanonicalProduct {
  const primary = drafts[0]!;
  const baseTitle = polishTitle(primary.facets.baseTitle || primary.title);

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

  let axes = activeAxes;
  if (drafts.length > 1) {
    const varying = axisNames.filter((n) => (axisValues.get(n)?.size ?? 0) > 1);
    axes = (varying.length ? varying : activeAxes).slice(0, 3);
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
      barcode: v.barcode,
      sourceWooId: v.sourceWooId,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      available: v.available,
      options: variantOpts,
      image: v.image,
    });
  }

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
    attributes: {
      ...primary.attributes,
      ...(primary.variants[0]?.barcode
        ? { Barkod: primary.variants[0].barcode }
        : {}),
    },
    published: drafts.some((d) => d.published),
    status: drafts.some((d) => d.published) ? "active" : "draft",
    needsReview: needsReview.size ? [...needsReview] : undefined,
  };
}

function groupDrafts(drafts: DraftProduct[]): CanonicalProduct[] {
  const buckets = new Map<string, DraftProduct[]>();
  for (const d of drafts) {
    const base = d.facets.baseTitle || d.title;
    const key = canGroupByBaseTitle(base)
      ? groupingKey(d.collectionHandle, base)
      : `solo::${d.variants[0]?.sku ?? d.sourceId}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  const products: CanonicalProduct[] = [];
  const usedHandles = new Set<string>();

  for (const group of buckets.values()) {
    let merged = mergeGroup(group);

    if (group.length > 1) {
      const varying =
        merged.options.length > 0 &&
        merged.options.some((o) => o.name !== "Title" && o.values.length > 1);
      if (!varying) {
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

export function findSkuCollisions(
  skus: CanonicalSku[]
): UnmappedReport["skuCollisions"] {
  const map = new Map<string, number[]>();
  for (const s of skus) {
    const key = s.sku.trim();
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s.sourceId);
  }
  return [...map.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([sku, sourceIds]) => ({ sku, sourceIds }));
}

export function mergeSkus(skus: CanonicalSku[]): {
  products: CanonicalProduct[];
  report: Omit<UnmappedReport, "mappedAt">;
  draftCount: number;
} {
  const drafts: DraftProduct[] = [];
  const excluded: UnmappedReport["excluded"] = [];
  const unmappedCatCounts = new Map<
    string,
    { count: number; samples: string[] }
  >();
  let skippedUnmapped = 0;

  for (const sku of skus) {
    const result = toDraft(sku);
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
        if (entry.samples.length < 5) entry.samples.push(sku.sku);
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
  for (const p of products) {
    collectionCounts[p.collectionHandle] =
      (collectionCounts[p.collectionHandle] ?? 0) + 1;
    if (p.needsReview?.length) {
      needsReview.push({
        id: p.sourceId,
        handle: p.handle,
        reasons: p.needsReview,
      });
    }
  }

  return {
    products,
    draftCount: drafts.length,
    report: {
      excluded,
      unmappedCategories: [...unmappedCatCounts.entries()]
        .map(([slug, v]) => ({
          slug,
          productCount: v.count,
          sampleSkus: v.samples,
        }))
        .sort((a, b) => b.productCount - a.productCount),
      needsReview,
      collectionCounts,
      skuCollisions: findSkuCollisions(skus),
    },
  };
}
