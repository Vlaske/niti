import fs from "node:fs/promises";
import path from "node:path";
import { sleep } from "./http";
import { CANONICAL_FILE, IMAGES_DIR } from "./paths";
import { USER_AGENT } from "./paths";
import type { CanonicalFile } from "./types";

function extFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname);
    const ext = path.extname(base).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return ext;
  } catch {
    /* ignore */
  }
  return ".jpg";
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "image/*,*/*" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

async function main() {
  const force = process.argv.includes("--force");
  const limitEq = process.argv.find((a) => a.startsWith("--limit="));
  const limitIdx = process.argv.indexOf("--limit");
  const limit = limitEq
    ? Number(limitEq.split("=")[1])
    : limitIdx >= 0
      ? Number(process.argv[limitIdx + 1])
      : undefined;

  const canonical = JSON.parse(
    await fs.readFile(CANONICAL_FILE, "utf8")
  ) as CanonicalFile;

  let products = canonical.products;
  if (limit && Number.isFinite(limit)) {
    products = products.slice(0, limit);
  }

  await fs.mkdir(IMAGES_DIR, { recursive: true });
  console.log(`Downloading images for ${products.length} products…`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    const dir = path.join(IMAGES_DIR, product.handle);
    await fs.mkdir(dir, { recursive: true });

    for (let i = 0; i < product.images.length; i++) {
      const img = product.images[i]!;
      const ext = extFromUrl(img.src);
      const filename = `${String(i + 1).padStart(2, "0")}${ext}`;
      const dest = path.join(dir, filename);
      const rel = path.relative(process.cwd(), dest).replace(/\\/g, "/");

      if (!force && (await fileExists(dest))) {
        img.localPath = rel;
        skipped += 1;
        continue;
      }

      try {
        await download(img.src, dest);
        img.localPath = rel;
        downloaded += 1;
        await sleep(150);
      } catch (err) {
        failed += 1;
        console.warn(`  fail ${product.handle} #${i + 1}: ${String(err)}`);
      }
    }
  }

  await fs.writeFile(CANONICAL_FILE, JSON.stringify(canonical, null, 2), "utf8");
  console.log(
    `Images done. downloaded=${downloaded} skipped=${skipped} failed=${failed}`
  );
  console.log(`Updated localPath fields in ${CANONICAL_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
