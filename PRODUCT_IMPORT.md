# Product import (Viktorija → NITI. → Shopify)

Local-only pipeline. Scraped dumps live under `data/viktorija/` (**gitignored**) and never go to Vercel.

NITI reads **Shopify collections** whose handles match `src/config/store-categories.ts`. Products get into those collections via tags — not by putting 1,800 SKUs in the Next.js repo.

---

## How products land on the site

```
Viktorija API → canonical.json → Shopify CSV
                           ↘ automated collections (tag rules)
Shopify collections  →  Next.js /shop/peskiri, /shop/spavaca-soba, …
```

Each product is tagged:

| Tag | Example | Used for |
|-----|---------|----------|
| `niti:<leaf>` | `niti:peskiri` | Category page `/shop/peskiri` |
| `room:<group>` | `room:kupatilo` | Room page `/shop/kupatilo` |
| `filter:<facet>` | `filter:plazni` | Later filters (plažni, lastiš, …) |

---

## 1. Refresh local files (already done once)

```bash
npm run import:viktorija:map
npm run import:viktorija:export
```

Outputs (gitignored):

- `data/viktorija/shopify-products.csv`
- `data/viktorija/shopify-collections.csv`
- `data/viktorija/images/{handle}/01.jpg` — originals for AI later

---

## 2. Import into Shopify Admin (this is the live step)

I cannot log into your Shopify from here without an **Admin API** token (`SHOPIFY_ADMIN_ACCESS_TOKEN`). Storefront tokens only *read* the catalog.

### A. Collections (do this first)

**Option A — script** (if Admin token is set):

```bash
npm run import:viktorija:collections
```

**Option B — Admin UI** (no token):

1. Shopify Admin → **Products → Collections → Create collection**
2. Type: **Automated**
3. Condition: **Product tag** is equal to `niti:peskiri`
4. **Handle** in Search engine listing (or collection URL) must be exactly `peskiri`

Repeat for every leaf:

`posteljine`, `carsavi`, `jastuci-i-jastucnice`, `jorgani-i-prekrivaci`, `cebad`, `nadduseci`, `peskiri`, `bade-mantili`, `kupatilski-setovi`, `prostirke`, `stolnjaci`, `kuhinjske-krpe`, `kecelje`, `dekorativni-tekstil`, `deciji-program`, `hotelski-program`

Then rooms (same, tag `room:<id>`):

`spavaca-soba`, `kupatilo`, `kuhinja`, `dnevna-soba`

(Dečiji / hotelski already exist as leaves.)

You can also **Products → Collections → Import** `data/viktorija/shopify-collections.csv` if your plan supports collection CSV.

### B. Products

1. **Products → Import**
2. Upload `data/viktorija/shopify-products.csv`
3. Overwrite existing products by handle only if you are re-importing
4. Wait until the email/job finishes (~1,800 products)

### C. Publish to Headless

CSV import often publishes only **Online Store**. Headless needs:

1. Open a product → **Publishing** → tick **Headless** (and Online Store)
2. Or run: `npm run import:viktorija:publish` (needs Admin token)

### D. Check the site

```bash
npm run dev
```

Open `/shop/peskiri` and `/shop/spavaca-soba`. Health: `/api/shopify/health`

---

## 3. Admin credentials (Dev Dashboard)

Shopify no longer shows a copy-paste `shpat_` Admin token. Put **Client ID** and **Client secret** in `.env.local`:

```env
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=
```

From [dev.shopify.com](https://dev.shopify.com/dashboard/) → your import app → **Settings**.

The app must be **installed on nitihome**, and a version must include write scopes (`write_products`, `write_files`, `write_publications`). Then:

```bash
npm run import:viktorija:collections
```

---

## 4. Update images later (AI)

Convention:

| Folder | What |
|--------|------|
| `data/viktorija/images/{handle}/01.jpg` | Original scrape |
| `data/viktorija/images-ai/{handle}/01.jpg` | NITI-styled shots (same handle, same filename order) |

Replace on Shopify without re-importing the whole CSV:

```bash
# all products that have files in images-ai (falls back to originals)
npm run import:viktorija:push-images -- --from=ai

# one product
npm run import:viktorija:push-images -- --from=ai --handle=peskir-ltd-siva-boja-70x140cm-d5

# force originals
npm run import:viktorija:push-images -- --from=original --limit=10
```

Handles stay stable — that is the join key between local files and Shopify.

---

## Category mapping (NITI)

Source leaves merge into public handles (`CATEGORY_ARCHITECTURE.md`):

- lastiš / nepromočivi → `carsavi` + `filter:lastis` / `filter:nepromociv`
- plažni peškiri → `peskiri` + `filter:plazni`
- kids → `deciji-program`
- **Excluded:** pidžame, spavaćice, Texas jakne

Titles are polished (consistent casing, NITI. branding). Same product in different sizes/colors/designs is merged into **one Shopify product with variants** (`Dimenzija` / `Veličina` / `Boja` / `Dezen`) in `scripts/viktorija/copy.ts` + `map.ts`. Re-run `npm run import:viktorija:map` after a scrape to get the same behavior.

---

## Don’t

- Don’t invent 25 nav categories
- Don’t commit `data/viktorija/`
- Don’t put the scraper on Vercel
- Don’t skip Headless publishing if the shop page is empty after import
