# Product import (Viktorija → NITI. → Shopify)

## Prefer the standalone app

Day-to-day catalog work is in a **separate folder** (not this website):

**`C:\Users\Luka-PC\niti-catalog`** → double-click **`Start Catalog.bat`**

That GUI handles CSV/XML, review, edits, live Shopify compare, and Shopify CSV export.  
It never deploys with the live site. Details: [`CATALOG_TOOL.md`](CATALOG_TOOL.md) and `niti-catalog/README.md`.

---

## Legacy CLI (optional, this repo)

Local-only scripts under `scripts/catalog/`.  
Dumps under `data/viktorija/` (**gitignored**) never go to GitHub or Vercel.

The live Next.js site only **reads** Shopify Storefront API. There is no public admin/import UI on the deployed domain.

---

## Security (deploy)

| Asset | GitHub | Live server |
|-------|--------|-------------|
| `scripts/catalog/*` (code) | Yes | Unused by Next build |
| `data/viktorija/*` (CSV/XML/canonical/images) | **No** | **No** |
| `VIKTORIJA_XML_URL`, Admin secrets | `.env.local` only | Not needed for storefront |
| Catalog Studio | `npm run catalog:studio` → `127.0.0.1:3847` | **Not deployed** |

Do not add `/admin` product-management routes to the Next app.

---

## Identity (orders)

| Source | Shopify |
|--------|---------|
| Woo `Šifra proizvoda` (e.g. `VLK000108-zeleni`) | **Variant SKU** (join key forever) |
| Barkod | Variant barcode |
| Woo post ID | Stored on variant in `canonical.json` / `sku-index.json` for audit |

Diff and re-import always match on **SKU**, not title.

---

## Pipeline

```
CSV and/or XML  →  ingest.json  →  merge  →  canonical.json + sku-index.json
                                              ↓
                                    diff (snapshot | Shopify)
                                              ↓
                                    shopify-products.csv → Shopify Admin
                                              ↓
                                    NITI. Storefront API
```

### Commands

```bash
# 1) Ingest WooCommerce CSV (positional args work best on Windows)
npm run catalog:ingest -- csv "C:\Users\…\wc-product-export.csv"

# 1b) Or XML feed — set VIKTORIJA_XML_URL in .env.local first
npm run catalog:ingest -- xml
#    or offline: npm run catalog:ingest -- xml "C:\Users\…\feed.xml"

# 2) Map categories, merge color/size into variants
npm run catalog:merge

# 3) See what changed vs last merge (or vs live Shopify)
npm run catalog:diff
npm run catalog:diff -- --against=shopify

# 4) Review locally (optional)
npm run catalog:studio
# → http://127.0.0.1:3847

# 5) Write Shopify CSVs into data/viktorija/
npm run catalog:export
```

Outputs (gitignored):

- `data/viktorija/ingest.json` / `ingest-report.json`
- `data/viktorija/canonical.json` / `sku-index.json` / `unmapped-report.json`
- `data/viktorija/diff-report.json`
- `data/viktorija/shopify-products.csv`
- `data/viktorija/shopify-collections.csv`

---

## Shopify Admin import

1. **Collections first** — import `shopify-collections.csv` or create automated collections:
   - Product tag equals `niti:peskiri` → handle `peskiri`
   - Product tag equals `room:kupatilo` → handle `kupatilo`
   - Repeat for every leaf/room in `src/config/store-categories.ts`
2. **Products** — import `shopify-products.csv`
3. **Publish to Headless** sales channel (CSV often only publishes Online Store)
4. Confirm `/api/shopify/health` and `/shop/peskiri`

Tags written by the exporter:

| Tag | Example | Used for |
|-----|---------|----------|
| `niti:<leaf>` | `niti:peskiri` | `/shop/peskiri` |
| `room:<group>` | `room:kupatilo` | `/shop/kupatilo` |
| `filter:<facet>` | `filter:plazni` | filters |

Excluded by default: pidžame, Texas jakne, baštenski program.

---

## Env (local only)

See `.env.example`:

```env
VIKTORIJA_XML_URL=
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
SHOPIFY_STORE_DOMAIN=
```

Never paste secrets into chat or commit `.env.local`.

---

## Category mapping

Source leaves merge into public handles (`CATEGORY_ARCHITECTURE.md` + `scripts/catalog/category-map.ts`).

Titles are polished; same product in different sizes/colors/designs becomes **one Shopify product with variants** (`Dimenzija` / `Veličina` / `Boja` / `Dezen`). Each variant keeps its own **SKU**.

---

## Don’t

- Don’t commit `data/viktorija/`
- Don’t put Catalog Studio or dump downloads on Vercel
- Don’t invent 25 nav categories
- Don’t skip Headless publishing if the shop page is empty after import
- Don’t trust Woo “Zalihe” numbers as live POS — manage stock in Shopify after go-live
