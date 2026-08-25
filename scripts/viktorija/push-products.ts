/**
 * Create products in Shopify from canonical.json (resume-safe by handle).
 * Prefer CSV import for the first bulk load; use this to fill gaps or re-run.
 *
 *   npm run import:viktorija:push-products -- --limit=5
 */
import fs from "node:fs/promises";
import { adminGraphql, sleep } from "./admin";
import { CANONICAL_FILE } from "./paths";
import type { CanonicalFile, CanonicalProduct } from "./types";
import { listPublications, publishToAll } from "./publish-lib";

async function findByHandle(handle: string): Promise<string | null> {
  const data = await adminGraphql<{
    productByIdentifier: { id: string } | null;
  }>(
    `query P($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) { id }
    }`,
    { handle }
  );
  return data.productByIdentifier?.id ?? null;
}

async function createProduct(product: CanonicalProduct): Promise<string> {
  const variant = product.variants[0];
  const opt1 = product.options[0];
  const data = await adminGraphql<{
    productCreate: {
      product: { id: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation Create($input: ProductInput!) {
      productCreate(input: $input) {
        product { id }
        userErrors { message }
      }
    }`,
    {
      input: {
        title: product.title,
        handle: product.handle,
        descriptionHtml: product.descriptionHtml,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        status: "ACTIVE",
        variants: [
          {
            sku: variant?.sku,
            price: String(variant?.price ?? 0),
            compareAtPrice: variant?.compareAtPrice
              ? String(variant.compareAtPrice)
              : undefined,
            barcode: product.attributes["Barkod"] || undefined,
            options: variant?.options.length
              ? variant.options.map((o) => o.value)
              : ["Default Title"],
            inventoryPolicy: "DENY",
          },
        ],
        options: product.options.length
          ? product.options.map((o) => o.name)
          : ["Title"],
      },
    }
  );
  const err = data.productCreate.userErrors;
  if (err.length) throw new Error(err.map((e) => e.message).join("; "));
  const id = data.productCreate.product?.id;
  if (!id) throw new Error("no product id");

  const imageUrls = product.images.map((i) => i.src).filter(Boolean);
  if (imageUrls.length) {
    await adminGraphql(
      `mutation Media($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          userErrors { message }
        }
      }`,
      {
        productId: id,
        media: imageUrls.map((originalSource) => ({
          originalSource,
          alt: product.title,
          mediaContentType: "IMAGE",
        })),
      }
    );
  }
  return id;
}

function argValue(name: string): string | undefined {
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const idx = process.argv.indexOf(name);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

async function main() {
  const limit = Number(argValue("--limit") ?? "") || undefined;
  const force = process.argv.includes("--force");
  const canonical = JSON.parse(
    await fs.readFile(CANONICAL_FILE, "utf8")
  ) as CanonicalFile;
  let products = canonical.products;
  if (limit) products = products.slice(0, limit);

  const pubs = await listPublications().catch(() => []);
  const pubIds = pubs.map((p) => p.id);

  console.log(`Pushing ${products.length} products to Shopify…`);
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const existing = await findByHandle(product.handle);
      if (existing && !force) {
        skipped += 1;
        continue;
      }
      const id = existing && force ? existing : await createProduct(product);
      if (pubIds.length) {
        await publishToAll(id, pubIds).catch(() => undefined);
      }
      created += 1;
      if (created % 20 === 0) console.log(`  created ${created}…`);
      await sleep(400);
    } catch (err) {
      failed += 1;
      console.warn(`  fail ${product.handle}: ${String(err)}`);
      await sleep(600);
    }
  }
  console.log(`Products: created=${created} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
