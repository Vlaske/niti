/**
 * Local-only Catalog Studio.
 * Binds to 127.0.0.1 — never exposed on the public Next.js deploy.
 *
 *   npm run catalog:studio
 *   open http://127.0.0.1:3847
 */
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { loadLocalEnv } from "../load-env";
import { diffSkuIndexes } from "../diff";
import { buildSkuIndex } from "../fingerprint";
import {
  CANONICAL_FILE,
  DATA_DIR,
  DIFF_FILE,
  EXCLUSIONS_FILE,
  INGEST_FILE,
  INGEST_REPORT_FILE,
  PREVIOUS_CANONICAL_FILE,
  ROOT,
  SKU_INDEX_FILE,
  STUDIO_HOST,
  STUDIO_PORT,
  UNMAPPED_FILE,
} from "../paths";
import { adminConfigured } from "../admin";
import { fetchShopifySkuIndex } from "../shopify-index";
import type { CanonicalFile, SkuIndexFile } from "../types";

loadLocalEnv();

const PUBLIC_DIR = path.join(ROOT, "scripts", "catalog", "studio", "public");

async function readJson(file: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function loadSourceIndex(): Promise<SkuIndexFile> {
  const idx = (await readJson(SKU_INDEX_FILE)) as SkuIndexFile | null;
  if (idx?.bySku) return idx;
  const canonical = (await readJson(CANONICAL_FILE)) as CanonicalFile | null;
  if (!canonical?.products) {
    throw new Error("Missing canonical.json — run catalog:merge first");
  }
  return buildSkuIndex(canonical);
}

function send(
  res: http.ServerResponse,
  status: number,
  body: unknown,
  type = "application/json"
) {
  const payload =
    typeof body === "string" ? body : JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": `${type}; charset=utf-8`,
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

async function runDiff(against: "snapshot" | "shopify") {
  const source = await loadSourceIndex();
  let remote: SkuIndexFile;

  if (against === "shopify") {
    if (!adminConfigured()) {
      throw new Error(
        "Shopify Admin not configured. Add SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (and SHOPIFY_STORE_DOMAIN) to .env.local"
      );
    }
    remote = await fetchShopifySkuIndex();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DATA_DIR, "shopify-sku-index.json"),
      JSON.stringify(remote, null, 2),
      "utf8"
    );
  } else {
    const prev = (await readJson(PREVIOUS_CANONICAL_FILE)) as CanonicalFile | null;
    remote = prev?.products
      ? buildSkuIndex(prev)
      : { mappedAt: "", count: 0, bySku: {} };
  }

  const report = diffSkuIndexes(source, remote, against);
  await fs.writeFile(DIFF_FILE, JSON.stringify(report, null, 2), "utf8");
  return report;
}

async function handler(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const url = new URL(req.url || "/", `http://${STUDIO_HOST}:${STUDIO_PORT}`);

  if (url.pathname === "/api/health") {
    send(res, 200, {
      ok: true,
      host: STUDIO_HOST,
      note: "local-only — not part of the live NITI site",
      shopifyAdminConfigured: adminConfigured(),
      xmlUrlConfigured: Boolean(process.env.VIKTORIJA_XML_URL?.trim()),
    });
    return;
  }

  if (url.pathname === "/api/canonical") {
    send(
      res,
      200,
      (await readJson(CANONICAL_FILE)) ?? {
        error: "missing canonical.json — run catalog:merge",
      }
    );
    return;
  }

  if (url.pathname === "/api/ingest") {
    send(
      res,
      200,
      (await readJson(INGEST_FILE)) ?? {
        error: "missing ingest.json — run catalog:ingest",
      }
    );
    return;
  }

  if (url.pathname === "/api/diff") {
    send(
      res,
      200,
      (await readJson(DIFF_FILE)) ?? {
        error: "missing diff — run catalog:diff or use Compare in Studio",
      }
    );
    return;
  }

  if (url.pathname === "/api/report") {
    send(res, 200, {
      ingest: await readJson(INGEST_REPORT_FILE),
      unmapped: await readJson(UNMAPPED_FILE),
      skuIndex: await readJson(SKU_INDEX_FILE),
      exclusions: await readJson(EXCLUSIONS_FILE),
      health: {
        shopifyAdminConfigured: adminConfigured(),
        xmlUrlConfigured: Boolean(process.env.VIKTORIJA_XML_URL?.trim()),
      },
    });
    return;
  }

  if (url.pathname === "/api/diff-run" && req.method === "POST") {
    const againstParam = url.searchParams.get("against") || "snapshot";
    const against =
      againstParam === "shopify" ? ("shopify" as const) : ("snapshot" as const);
    try {
      const report = await runDiff(against);
      send(res, 200, report);
    } catch (err) {
      send(res, 400, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (url.pathname === "/api/exclusions" && req.method === "POST") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString("utf8");
    try {
      const data = JSON.parse(raw);
      await fs.writeFile(EXCLUSIONS_FILE, JSON.stringify(data, null, 2), "utf8");
      send(res, 200, { ok: true });
    } catch {
      send(res, 400, { ok: false, error: "invalid JSON" });
    }
    return;
  }

  let filePath = path.join(
    PUBLIC_DIR,
    url.pathname === "/" ? "index.html" : url.pathname.replace(/^\//, "")
  );
  if (!filePath.startsWith(PUBLIC_DIR)) {
    send(res, 403, "Forbidden", "text/plain");
    return;
  }
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const type =
      ext === ".html"
        ? "text/html"
        : ext === ".css"
          ? "text/css"
          : ext === ".js"
            ? "text/javascript"
            : "application/octet-stream";
    send(res, 200, data.toString("utf8"), type);
  } catch {
    send(res, 404, "Not found", "text/plain");
  }
}

const server = http.createServer((req, res) => {
  handler(req, res).catch((err) => {
    console.error(err);
    send(res, 500, { error: "internal" });
  });
});

server.listen(STUDIO_PORT, STUDIO_HOST, () => {
  console.log(
    `Catalog Studio (local only) → http://${STUDIO_HOST}:${STUDIO_PORT}`
  );
  console.log(
    "Not on the live site. Not reachable from other machines. Ctrl+C to stop."
  );
});
