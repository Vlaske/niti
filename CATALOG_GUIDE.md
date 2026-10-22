# NITI. Catalog toolkit — operator guide

> **Prefer the standalone app:** `C:\Users\Luka-PC\niti-catalog` (`Start Catalog.bat`).  
> See [`CATALOG_TOOL.md`](CATALOG_TOOL.md). This page describes the older in-repo CLI.

This is the **complete overview** of the local product import system: what exists, what it does, how to use CSV and XML, how to compare to live Shopify, and why none of this appears on the live website.

---

## 1. Big picture (what we have)

You have three layers. Only the last one is public.

| Layer | What | Where customers see it |
|-------|------|------------------------|
| **A. Catalog toolkit** | Parse Viktorija CSV/XML, merge variants, review, export | **Never** — only on your PC |
| **B. Shopify** | Live products, stock, prices, checkout | Shopify Admin + checkout |
| **C. NITI. website** | Beautiful shop UI | Your live domain (reads Shopify only) |

```
Viktorija (CSV or XML)
        │
        ▼
  scripts/catalog  +  data/viktorija   ← LOCAL ONLY
        │
        ▼
  Shopify CSV / Admin import
        │
        ▼
  Shopify catalog
        │
        ▼
  NITI. Next.js site (Storefront API)
```

**Catalog Studio is not uploaded as a public page.** It only runs when you type `npm run catalog:studio` and opens on `http://127.0.0.1:3847`. GitHub/Vercel deploy the Next.js shop — they do **not** run Studio, and they do **not** include product dump files (`data/viktorija/` is gitignored).

---

## 2. What each piece is for

### Code (safe to commit to GitHub)

Folder: `scripts/catalog/`

| Piece | Role |
|-------|------|
| `ingest.ts` | Load **CSV** or **XML** → `ingest.json` |
| `parse-csv.ts` / `parse-xml.ts` | Turn Woo export into the same SKU shape |
| `merge-cli.ts` + `merge.ts` | Map categories, exclude apparel, merge colors/sizes into Shopify-style products |
| `diff-cli.ts` + Studio “Compare” | What is new / changed / missing (vs last merge **or live Shopify**) |
| `export-cli.ts` | Write `shopify-products.csv` + `shopify-collections.csv` |
| `studio/` | Local browser UI to browse **full fields** and run diffs |

### Data (never commit / never deploy)

Folder: `data/viktorija/` (gitignored)

| File | Meaning |
|------|---------|
| `ingest.json` | Last successful parse (all raw SKUs) |
| `ingest-csv.json` / `ingest-xml.json` | Last parse per source (for comparing CSV vs XML) |
| `canonical.json` | Merged products ready for Shopify |
| `sku-index.json` | Flat map **SKU → handle, price, barcode, woo id** |
| `diff-report.json` | Last comparison result |
| `unmapped-report.json` | Excluded / unmapped categories |
| `shopify-products.csv` | File you upload in Shopify Admin |
| `shopify-collections.csv` | Automated collection rules |

---

## 3. Product codes (how orders stay trackable)

Every sellable unit keeps Viktorija’s **šifra** as the Shopify **variant SKU**.

| Field | Example | Where it goes |
|-------|---------|----------------|
| Šifra proizvoda | `VLK000108-zeleni` | Shopify **Variant SKU** (primary join key) |
| Barkod | `8605070600024` | Shopify variant barcode |
| Woo ID | `29462` | Kept in `canonical` / `sku-index` for audit |

When someone orders that towel, the order line shows `VLK000108-zeleni` — warehouse can match Viktorija exactly. Re-imports and diffs always match on **SKU**, not on title.

---

## 4. Day-to-day workflow

### Step A — Ingest (CSV **or** XML)

**CSV** (file you already have):

```bash
npm run catalog:ingest -- csv "C:\Users\Luka-PC\Downloads\wc-product-export-….csv"
```

**XML** (often fresher if the feed works) — put the private feed URL only in `.env.local`:

```env
VIKTORIJA_XML_URL=https://www.viktorijaleskovac.rs/wp-load.php?security_token=…&export_id=…&action=get_data
```

Then:

```bash
npm run catalog:ingest -- xml
```

Or from a downloaded XML file:

```bash
npm run catalog:ingest -- xml "C:\Users\…\feed.xml"
```

Both paths produce the **same** internal format. Prefer XML when the feed is healthy; use CSV as backup. If you have both:

```bash
npm run catalog:diff-sources
```

→ writes `data/viktorija/diff-csv-vs-xml.json` (SKU differences between the two sources).

### Step B — Merge

```bash
npm run catalog:merge
```

This:

- Maps Viktorija categories → NITI rooms/leaves + `niti:` / `room:` / `filter:` tags  
- Drops pidžame / Texas / baštenski by default  
- Merges related SKUs into one product with options (`Boja`, `Dimenzija`, `Veličina`, …)  
- Writes `canonical.json` + `sku-index.json`

### Step C — Compare (optional but recommended)

**Vs previous merge** (what changed since last time):

```bash
npm run catalog:diff
```

**Vs live Shopify** (needs Admin credentials in `.env.local`):

```bash
npm run catalog:diff -- --against=shopify
```

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_CLIENT_ID=…
SHOPIFY_CLIENT_SECRET=…
```

Diff statuses:

| Status | Meaning |
|--------|---------|
| `new` | In Viktorija export, not in Shopify (or not in previous merge) |
| `changed` | Same SKU; price / title / handle / collection / barcode differ |
| `missing_in_source` | In Shopify, gone from current export |
| `unchanged` | Same fingerprint |

### Step D — Review in Catalog Studio (full fields)

```bash
npm run catalog:studio
```

Open **http://127.0.0.1:3847** (only on your machine).

You can:

- Search by title / SKU / barcode / handle  
- Filter by collection and diff status  
- **Click a row** → drawer with **all relevant fields**: SKU, barcode, Woo ID, price, options, all sibling variants, tags, source categories, care/material attributes, description HTML, image URLs, raw ingest row, diff vs remote  
- **Diff vs last merge** button  
- **Compare to live Shopify** button (same Admin env as above)

### Step E — Export and import to Shopify

```bash
npm run catalog:export
```

Then in Shopify Admin:

1. Import / create **collections** from `shopify-collections.csv` (or manual automated collections by tag)  
2. Import **products** from `shopify-products.csv`  
3. Publish products to the **Headless** channel  
4. Check the live site `/shop/peskiri` and `/api/shopify/health`

Day-to-day stock and price edits after that: **Shopify Admin**, not this toolkit.

---

## 5. Security checklist (live site stays clean)

| Do | Don’t |
|----|-------|
| Commit `scripts/catalog/` code | Commit `data/viktorija/` dumps |
| Keep `VIKTORIJA_XML_URL` and Admin secrets in `.env.local` | Put feed tokens in the Next.js frontend |
| Run Studio on `127.0.0.1` | Add `/admin` catalog pages to the deployed Next app |
| Deploy only the storefront to Vercel/GitHub | Expect Studio or CSV dumps on the public domain |

`.gitignore` already blocks `/data/viktorija/` and `.env*` (except `.env.example`).

The live site never “runs” this tool. Customers only see products that already live in Shopify.

---

## 6. Quick command cheat sheet

```bash
# CSV
npm run catalog:ingest -- csv "PATH\to\export.csv"

# XML (URL from .env.local)
npm run catalog:ingest -- xml

# Merge + reports
npm run catalog:merge

# Diff
npm run catalog:diff
npm run catalog:diff -- --against=shopify
npm run catalog:diff-sources

# UI
npm run catalog:studio

# Shopify files
npm run catalog:export
```

More detail also in [`PRODUCT_IMPORT.md`](PRODUCT_IMPORT.md) and [`scripts/catalog/README.md`](scripts/catalog/README.md).
