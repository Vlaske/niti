/**
 * Replace Shopify product images by handle.
 *
 * Defaults to AI folder when present, otherwise originals.
 *
 *   npm run import:viktorija:push-images -- --from=ai
 *   npm run import:viktorija:push-images -- --from=original
 *   npm run import:viktorija:push-images -- --handle=peskir-ltd-siva-boja-70x140cm-d5
 *
 * Put improved shots in data/viktorija/images-ai/{handle}/01.jpg …
 */
import fs from "node:fs/promises";
import path from "node:path";
import { adminConfigured, adminGraphql, getStoreDomain, sleep } from "./admin";
import { CANONICAL_FILE, IMAGES_AI_DIR, IMAGES_DIR } from "./paths";
import type { CanonicalFile } from "./types";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function argValue(name: string): string | undefined {
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split("=")[1];
  const idx = process.argv.indexOf(name);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

async function listLocalImages(dir: string): Promise<string[]> {
  try {
    const names = await fs.readdir(dir);
    return names
      .filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase()))
      .sort()
      .map((n) => path.join(dir, n));
  } catch {
    return [];
  }
}

async function productByHandle(handle: string): Promise<{
  id: string;
  mediaIds: string[];
} | null> {
  const data = await adminGraphql<{
    productByIdentifier: {
      id: string;
      media: { nodes: { id: string }[] };
    } | null;
  }>(
    `query Product($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id
        media(first: 20) {
          nodes { id }
        }
      }
    }`,
    { handle }
  );
  const p = data.productByIdentifier;
  if (!p) return null;
  return { id: p.id, mediaIds: p.media.nodes.map((m) => m.id) };
}

async function deleteMedia(productId: string, mediaIds: string[]) {
  if (!mediaIds.length) return;
  const data = await adminGraphql<{
    productDeleteMedia: { userErrors: { message: string }[] };
  }>(
    `mutation DeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
      productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
        userErrors { message }
      }
    }`,
    { productId, mediaIds }
  );
  const err = data.productDeleteMedia.userErrors;
  if (err.length) throw new Error(err.map((e) => e.message).join("; "));
}

async function stagedUpload(filePath: string): Promise<string> {
  const filename = path.basename(filePath);
  const mime =
    filename.toLowerCase().endsWith(".png")
      ? "image/png"
      : filename.toLowerCase().endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
  const buf = await fs.readFile(filePath);

  const staged = await adminGraphql<{
    stagedUploadsCreate: {
      stagedTargets: {
        url: string;
        resourceUrl: string;
        parameters: { name: string; value: string }[];
      }[];
      userErrors: { message: string }[];
    };
  }>(
    `mutation Staged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { message }
      }
    }`,
    {
      input: [
        {
          filename,
          mimeType: mime,
          resource: "FILE",
          httpMethod: "POST",
          fileSize: String(buf.length),
        },
      ],
    }
  );

  const err = staged.stagedUploadsCreate.userErrors;
  if (err.length) throw new Error(err.map((e) => e.message).join("; "));
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target) throw new Error("No staged upload target");

  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([buf], { type: mime }), filename);

  const upload = await fetch(target.url, { method: "POST", body: form });
  if (!upload.ok) {
    throw new Error(`Staged upload HTTP ${upload.status}`);
  }
  return target.resourceUrl;
}

async function attachMedia(
  productId: string,
  resourceUrls: string[],
  alt: string
) {
  const data = await adminGraphql<{
    productCreateMedia: { userErrors: { message: string }[] };
  }>(
    `mutation Media($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        userErrors { message }
      }
    }`,
    {
      productId,
      media: resourceUrls.map((originalSource) => ({
        originalSource,
        alt,
        mediaContentType: "IMAGE",
      })),
    }
  );
  const err = data.productCreateMedia.userErrors;
  if (err.length) throw new Error(err.map((e) => e.message).join("; "));
}

async function main() {
  if (!getStoreDomain() || !adminConfigured()) {
    console.error(
      "Need SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local (Custom app Admin API: write_products, write_files)."
    );
    process.exit(1);
  }

  const from = argValue("--from") ?? "ai";
  const only = argValue("--handle");
  const limit = Number(argValue("--limit") ?? "") || undefined;

  const canonical = JSON.parse(
    await fs.readFile(CANONICAL_FILE, "utf8")
  ) as CanonicalFile;

  let products = canonical.products;
  if (only) products = products.filter((p) => p.handle === only);
  if (limit) products = products.slice(0, limit);

  const baseDir = from === "original" ? IMAGES_DIR : IMAGES_AI_DIR;
  console.log(`Pushing images from ${baseDir} (${from}) for ${products.length} products…`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    let files = await listLocalImages(path.join(baseDir, product.handle));
    if (!files.length && from === "ai") {
      files = await listLocalImages(path.join(IMAGES_DIR, product.handle));
    }
    if (!files.length) {
      skipped += 1;
      continue;
    }

    try {
      const existing = await productByHandle(product.handle);
      if (!existing) {
        skipped += 1;
        continue;
      }
      await deleteMedia(existing.id, existing.mediaIds);
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await stagedUpload(file));
        await sleep(150);
      }
      await attachMedia(existing.id, urls, product.title);
      updated += 1;
      if (updated % 10 === 0) console.log(`  updated ${updated}…`);
      await sleep(250);
    } catch (err) {
      failed += 1;
      console.warn(`  fail ${product.handle}: ${String(err)}`);
    }
  }

  console.log(`Images: updated=${updated} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
