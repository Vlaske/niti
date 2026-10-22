# NITI. Catalog & Collections — Import Agent Guide

**Audience:** Agent / developer importing products (CSV/XML → Shopify) for the NITI. headless storefront.  
**Source of truth in code:** `src/config/store-categories.ts`  
**Related:** `CATEGORY_ARCHITECTURE.md`, `PRODUCT_IMPORT.md`, `src/types/index.ts`, `src/lib/shopify/mappers.ts`

The live site **only reads Shopify Storefront API**. It does not run import scripts. Correct Shopify structure (collections, tags, options, variants, images) is what makes products show in the right place.

---

## 1. How the storefront is organized (3 + 1 layers)

| Layer | What it is | Customer sees? | How import should set it |
|-------|------------|----------------|---------------------------|
| **Rooms (groups)** | Part of home / program | Homepage grid, mega menu, `/shop/{room}` | Tag `room:<groupId>` + Shopify collection handle = group id |
| **Leaf categories** | Product type inside a room | `/shop/{leaf}`, nav under room | Tag `niti:<leafHandle>` + collection handle = leaf |
| **Internal collections** | Fine-grained source splits | Usually **not** in main nav | Optional extra collections; map via `internalHandles` or `filter:` tags |
| **Filters / options** | Size, color, pattern, subtype | PDP pickers + leaf refine pills | Variant options + `filter:*` tags |

**Rule of thumb**

- **Category** = what the shopper thinks they want (Posteljine, Peškiri…)
- **Filter / option** = a product detail (Lastiš, 220×240, Boja, Dezen)
- **Internal collection** = admin grouping, not a new nav item

---

## 2. Rooms (groups) — already used

Routes: `/shop/spavaca-soba`, `/shop/kupatilo`, …

| Group ID (handle) | Title | Homepage / nav |
|-------------------|-------|----------------|
| `spavaca-soba` | Spavaća soba | Yes |
| `kupatilo` | Kupatilo | Yes |
| `kuhinja` | Kuhinja | Yes |
| `dnevna-soba` | Dnevna soba | Yes |
| `deciji-program` | Dečiji program | Yes |
| `hotelski-program` | Hotelski program | Yes |

**Required tag on every product:** `room:<groupId>`  
Example: `room:spavaca-soba`

**Shopify collection:** create (manual or smart) with handle = group id, e.g. handle `kupatilo` where tag equals `room:kupatilo`.

---

## 3. Leaf categories — already used (public nav)

Handles below are both:

1. **URL slug** → `/shop/{slug}`
2. **Preferred Shopify collection handle**
3. **Tag** → `niti:{collectionHandle}` (use the `collectionHandle` column)

`navHidden: true` means keep URL if needed, **hide from mega menu**.

### Spavaća soba

| slug | collectionHandle | Title | Notes |
|------|------------------|-------|-------|
| `posteljine` | `posteljine` | Posteljine | Featured |
| `carsavi` | `carsavi` | Čaršavi | Featured; also maps internal: `carsavi-lastis`, `carsavi-nepromocivi`, … |
| `jastuci` | `jastuci` | Jastuci | Featured; internal: `memorijski-jastuci` |
| `jastucnice` | `jastucnice` | Jastučnice | Featured |
| `jastuci-i-jastucnice` | `jastuci-i-jastucnice` | Jastuci i jastučnice | **navHidden** — combined URL; prefer splitting to `jastuci` / `jastucnice` |
| `jorgani-i-prekrivaci` | `jorgani-i-prekrivaci` | Jorgani i prekrivači | Featured; internal: `jorgani`, `prekrivaci`, `frotirni-prekrivaci`, `step-deke` |
| `cebad` | `cebad` | Ćebad | Featured |
| `nadduseci` | `nadduseci` | Naddušeci | |

### Kupatilo

| slug | collectionHandle | Title |
|------|------------------|-------|
| `peskiri` | `peskiri` | Peškiri (internal: `plazni-peskiri`, …) |
| `bade-mantili` | `bade-mantili` | Bade mantili |
| `kupatilski-setovi` | `kupatilski-setovi` | Kupatilski setovi |
| `prostirke` | `prostirke` | Prostirke i dodaci |

### Kuhinja

| slug | collectionHandle | Title |
|------|------------------|-------|
| `stolnjaci` | `stolnjaci` | Stolnjaci |
| `kuhinjske-krpe` | `kuhinjske-krpe` | Kuhinjske krpe |
| `kecelje` | `kecelje` | Kecelje |

### Dnevna soba

| slug | collectionHandle | Title |
|------|------------------|-------|
| `dekorativni-tekstil` | `dekorativni-tekstil` | Dekorativni tekstil (internal: `ukrasne-jastucnice`, `prekrivaci-tdf`, …) |

### Dečiji program

| slug | collectionHandle | Title |
|------|------------------|-------|
| `decija-posteljina` | `decija-posteljina` | Dečija posteljina |
| `decija-cebad` | `decija-cebad` | Dečija ćebad |
| `deciji-jastuci-i-jastucnice` | `deciji-jastuci` | Dečiji jastuci *(slug ≠ handle)* |
| `deciji-peskiri` | `deciji-peskiri` | Dečiji peškiri |

### Hotelski program

| slug | collectionHandle | Title |
|------|------------------|-------|
| `hotelski-program` | `hotelski-program` | Hotelski program |

---

## 4. Special Shopify collections (not leaf nav)

| Handle | Purpose |
|--------|---------|
| `novo-u-ponudi` | Homepage **“Novo u ponudi”** strip. Prefer this collection **and/or** product tag `novo-u-ponudi` |

Do **not** use Shopify’s default “Home page” / frontpage collection for new arrivals.

---

## 5. Tags the storefront understands

Write these on **products** during import (Shopify product tags).

| Tag pattern | Example | Effect |
|-------------|---------|--------|
| `niti:<leaf>` | `niti:peskiri` | Primary category mapping (highest priority after heuristics) |
| `room:<group>` | `room:kupatilo` | Room membership / room smart collections |
| `filter:<facet>` | `filter:plazni` | Refine pills **inside** a leaf (see §6) |
| `novo-u-ponudi` | same | Homepage New Arrivals (also: `new-arrivals`, `showcase:novo`) |

**Exporter convention (existing pipeline):**  
`niti:` + leaf handle, `room:` + group id, `filter:` + facet.

---

## 6. Leaf refine filters (`filter:*`)

Only shown on leaf shop pages when products in that leaf have matching tags.

| Leaf slug | Allowed tags | UI label |
|-----------|--------------|----------|
| `carsavi` | `filter:lastis`, `filter:nepromociv`, `filter:klasicni` | Lastiš / Nepromočivi / Klasični |
| `peskiri` | `filter:kupatilski`, `filter:plazni` | Kupatilski / Plažni |
| `jastuci` | `filter:memorijska-pena` | Memorijska pena |
| `jastucnice` | `filter:ukrasne-jastucnice` | Ukrasne jastučnice |
| `jorgani-i-prekrivaci` | `filter:jorgani`, `filter:prekrivaci`, `filter:frotirni`, `filter:step-deke` | … |
| `dekorativni-tekstil` | `filter:ukrasne-jastucnice`, `filter:dekorativni-prekrivaci` | … |
| `posteljine` | `filter:set` | Setovi |

Do **not** invent new top-level nav categories for “lastiš” / “plažni” — use these tags.

---

## 7. How the site decides “which category is this product?”

Code: `resolveCategories` / `mapShopifyProduct` in `src/lib/shopify/mappers.ts`.

**Order of signals (simplified):**

1. Product tags `niti:<handle>`
2. Shopify collections the product belongs to (handle matched to `STORE_CATEGORIES.collectionHandle` or `internalHandles`)
3. Title / tag / collection heuristics (kids, hotel, decorative, adult blankets, pillows…)
4. Products can be in **multiple** leaf categories (`categories[]`); one is **primary** (`category`) for breadcrumbs and card label

**Implications for import**

- Prefer explicit `niti:` + correct leaf collection over hoping title heuristics work.
- A kids duvet should get kids leaf + kids room — not only adult `posteljine`.
- Adult blankets titled “Ćebe…” must **not** land in Dečiji; mapper tries to prevent this, but correct tags help.
- Decorative pillowcases → `dekorativni-tekstil` (+ `jastucnice` when relevant).

Shop grids filter with `productMatchesCategory(product, slug)` using `category` + `categories[]`.

---

## 8. What each product must contain (Shopify → storefront)

### Required for a good listing

| Field | Notes |
|-------|--------|
| **Title** | Serbian Latin OK (Ć, č, š…). Used on cards + PDP |
| **Handle** | Unique URL slug `/product/{handle}` |
| **Status** | Active + published to **Headless / Storefront** sales channel (CSV often only Online Store) |
| **At least 1 image** | Empty image → broken/blank cards |
| **Price** | On variants (RSD). Storefront maps amounts as whole numbers |
| **Variant SKU** | Stable join key for re-import (e.g. Woo `Šifra proizvoda`) |
| **Tags** | At least `niti:<leaf>` + `room:<group>` |
| **Collections** | Leaf collection (and ideally room collection) |

### Strongly recommended

| Field | Notes |
|-------|--------|
| Description HTML | Shown under DETALJI on PDP |
| Multiple images | Ranking boost; gallery thumbs |
| Compare-at price | Sale styling on cards/PDP |
| Vendor | Shown as small brand line (often `NITI.`) |

### Variants & options (how PDP UI works)

Option names are detected by **name** (case-insensitive):

| Option type | Accepted option names | UI |
|-------------|----------------------|-----|
| **Color** | `Boja`, `Color`, `Colour`, `Farba` | Round swatches (hex guessed from name; “Dezen” as value gets pattern style) |
| **Size / dimension** | `Dimenzija`, `Dimenzije`, `Size`, `Veličina`, `Dimension` | Text chips (e.g. `220 x 240 cm`) |
| **Pattern** | Option name `Dezen` / `Pattern` / `Print` | Text chips (D2, D10, Standard…) — **not** color circles |
| **Other** | Anything else | Text chips |

**Every sellable combination** (color × size × dezen) should be a **real Shopify variant** with its own price/SKU/availability. The PDP picks the matching variant from selections.

**Cart:** needs a concrete `variantId` (Storefront GID). Products that require options block “add” until all options are chosen.

### Images ↔ color (optional but nice)

- Prefer variant featured images per color, **or**
- Media alt text containing the color name  
Storefront builds `colorImages` when mapping is reliable. Do not rely on positional image guessing.

---

## 9. How products are displayed (UX map)

### Homepage

| Block | Data source |
|-------|-------------|
| Hero | Config slides (`src/config/hero-slides.ts`) — not catalog |
| **Novo u ponudi** | Collection `novo-u-ponudi` and/or tag `novo-u-ponudi`; room dropdown filters by product category group |
| Rooms grid | Fixed 6 `CATEGORY_GROUPS` → `/shop/{groupId}` |
| Design carousel | Showcase config / catalog helper |
| FAQ | Static |

### Shop

| Route | Content |
|-------|---------|
| `/shop` | All products + room strip |
| `/shop/{groupId}` | Products in that room + leaf category strip |
| `/shop/{leaf}` | Products in leaf + optional `filter:*` refine |

Cards show: image, color dots, price, add/choose CTA, category label, title.

Default sort: **featured** score (images, options, new/sale, mid price, `novo-u-ponudi` tag).

### Product page `/product/{handle}`

- Gallery (no lightbox zoom currently)
- Title (display sans), price
- Option pickers: Dimenzija / Boja / Dezen as above
- Add to cart / view cart
- Details HTML + shipping/returns copy
- Related + recently viewed

---

## 10. Collections checklist to create in Shopify

### Room collections (smart recommended)

| Handle | Condition (example) |
|--------|---------------------|
| `spavaca-soba` | tag = `room:spavaca-soba` |
| `kupatilo` | tag = `room:kupatilo` |
| `kuhinja` | tag = `room:kuhinja` |
| `dnevna-soba` | tag = `room:dnevna-soba` |
| `deciji-program` | tag = `room:deciji-program` |
| `hotelski-program` | tag = `room:hotelski-program` |

### Leaf collections (smart recommended)

One per `collectionHandle` in §3, e.g.:

- tag = `niti:posteljine` → handle `posteljine`
- tag = `niti:carsavi` → handle `carsavi`
- …
- tag = `niti:deciji-jastuci` → handle `deciji-jastuci` (note slug on site is `deciji-jastuci-i-jastucnice`)

### Showcase

| Handle | Condition |
|--------|-----------|
| `novo-u-ponudi` | tag = `novo-u-ponudi` (or manual merchandising) |

### Optional internal (not main nav)

Examples already aliased in config: `carsavi-lastis`, `carsavi-nepromocivi`, `plazni-peskiri`, `ukrasne-jastucnice`, `prekrivaci-tdf`, `frotirni-prekrivaci`, `step-deke`, `memorijski-jastuci`, …

These help import from source XML categories; storefront maps them to public leaves via `internalHandles`.

---

## 11. Identity & re-import rules

| Source field | Shopify |
|--------------|---------|
| Stable product code / Woo Šifra | **Variant SKU** (join key forever) |
| Barcode | Variant barcode |
| Title | Can change; do not use as join key |

Diff / sync must match on **SKU**, not title.

**Excluded from catalog by default (legacy import notes):** pidžame, Texas jakne, baštenski program — do not map into main NITI home textiles unless product strategy changes.

---

## 12. Minimal “good product” example

```text
Title:        Ćebe Merinos
Handle:       cebe-merinos
Vendor:       NITI.
Tags:         niti:cebad, room:spavaca-soba, novo-u-ponudi
Collections:  cebad, spavaca-soba, novo-u-ponudi

Options:
  1. Dimenzija  — 160 x 220 cm | 220 x 240 cm
  2. Boja       — Ljubičasta | Mint | Braon | Siva
  3. Dezen      — D2 | D10 | D1 | Standard

Variants: one per combination, each with SKU + price + inventory
Images:   ≥1 (prefer ≥4); optional per-color variant images
Channel:  published to Storefront / Headless
```

---

## 13. Code pointers (if agent needs to verify)

| Topic | File |
|-------|------|
| Public taxonomy | `src/config/store-categories.ts` |
| Product TypeScript shape | `src/types/index.ts` |
| Shopify → Product mapping + category heuristics | `src/lib/shopify/mappers.ts` |
| Option name detection (Boja / Dimenzija / Dezen) | `src/lib/shopify/variants.ts` |
| New arrivals / featured sort | `src/lib/catalog/ranking.ts`, `src/lib/shopify/catalog.ts` |
| Import category map (legacy CLI) | `scripts/catalog/category-map.ts` |
| Architecture narrative | `CATEGORY_ARCHITECTURE.md` |
| Import pipeline / security | `PRODUCT_IMPORT.md` |

---

## 14. Do / Don’t for the XML import agent

**Do**

- Emit `niti:` + `room:` on every product
- Use leaf handles from §3 exactly (ASCII, hyphens)
- Put dimensions/colors/patterns as **Shopify options**, not as separate products (unless truly separate SKUs)
- Put subtype (lastiš, plažni…) as `filter:` tags, not new nav leaves
- Keep SKU stable across re-imports
- Publish to the sales channel the Storefront API uses

**Don’t**

- Create dozens of public nav categories for every Woo category
- Rely only on title text for kids vs adult / hotel / decorative
- Put adult blankets into Dečiji collections
- Use frontpage/home collection for “Novo u ponudi”
- Ship products with no images or unpublished to Headless

---

*Generated for handoff from the NITI. storefront repo. If `store-categories.ts` changes, that file wins over this document.*
