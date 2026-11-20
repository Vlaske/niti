# NITI. — Homepage sections

This document explains **every section on the homepage**: why it exists, what the customer should do, and the logic behind what is shown.

Source of truth for rooms/categories: `CATEGORY_ARCHITECTURE.md`  
Customer journey: `SITE_FLOW.md`  
Config: `src/config/store-categories.ts`  
Page: `src/app/page.tsx`

---

## Customer flow (how shopping should feel)

1. **Land** — hero sets mood and brand (NITI. = calm, premium home textile).
2. **See what’s new** — newest products, filtered by *room* (not 16 tiny categories).
3. **Choose a room** — Spavaća soba, Kupatilo, Kuhinja… (broad destination).
4. **Narrow inside the room** — Posteljine, Čaršavi, Peškiri… (specific need).
5. **Product** — variants, add to cart, checkout.

This matches the Prodavnica mega menu: **section first, categories under it**.

```
Home → Room (e.g. /shop/spavaca-soba) → Category (e.g. /shop/carsavi) → Product
```

---

## 1. Hero carousel

**Component:** `HeroCarousel`  
**Purpose:** First impression. Full-viewport video/image + brand line + CTAs.

**Logic:**
- Video/image from `src/config/hero-slides.ts`
- `singleVideoLoop` in `src/config/hero.ts` can lock one looping video
- Entrance loader covers the ~1s video load (`BrandEntranceLoader`)

**CTA:** view product / shop all — should point to a real room or shop, not a mock handle.

**Why here:** Premium textile brands lead with atmosphere, not a product grid.

---

## 2. Novo u ponudi (New arrivals)

**Component:** `NewArrivals`  
**Purpose:** Conversion — “what’s new” without forcing a category decision yet.

**What is shown:**
- Products from the live catalog (Shopify) or mock fallback
- Filters are **rooms** (Sve, Spavaća soba, Kupatilo, Kuhinja, Dnevna soba, Dečiji, Hotelski) — **not** every leaf category

**Why rooms, not 16 pills:**
- 16 category pills wrap into two messy rows and compete with the product cards
- Shoppers think “I need something for the bathroom,” then pick a towel
- Filtering by `product.category` → mapped to a room via `getGroupForCategorySlug()`

**CTA:** “Vidi sve” → `/shop`

---

## 3. Sniženo (sale edit)

**Component:** `SaleEdit`  
**Full ops guide:** `SALE_EDIT.md`  
**Switch:** `src/config/promo.ts` (`enabled`) or env `NITI_PROMO_ENABLED`  
**Off (band):** this block is not rendered. Price badges go back to dinar savings (not −%). The rest of the homepage is unchanged. **Sniženo** can still appear in the menu while real compare-at products exist.

**Purpose:** First thing after the hero, above Novo u ponudi. Charcoal band: “Sezonska selekcija”, serif “Izdvojeno na sniženju”, short lead, outline CTA. Square cards on charcoal with rose percent, room · leaf, title, today’s price, crossed price, and “Ušteda”. Phone: one full-width snap card. Desktop: four across; arrows appear when there are more than four. Cap is `maxProducts` (default 12). Menu / footer **Sniženo** (Percent icon + **Akcija** tag, same pattern as Novo) appears whenever discounted products exist.

**What is shown:**
- Up to 12 in-stock products with a real compare-at price (carousel)
- Sorted by the steepest honest percent, then by dinar savings
- Source, in order: Shopify collection `akcija` (when it contains discounted products) → `handles` in the config → any discounted product in the catalog
- If that collection exists but nothing in it is discounted, the block stays empty rather than filling itself with other products
- Optional end date (`endsOn`, `YYYY-MM-DD`, Europe/Belgrade). When set, a countdown runs until end of that day. With no date, no timer

**Price marking while the edit is on** (cards, product page, search, cart, design carousel):
- Current price, crossed previous price, and the percent off
- Percent is rounded **down** (19.6% shows as 19%)
- On the product page, dinar “Ušteda” sits on its own line
- Cuts under 1% keep the dinar badge and skip “−0%”
- Nothing unless compare-at is actually higher — the site does not invent a was-price

**CTA:** “Sva sniženja” → `/shop?snizeno=1` (all deals, default sort largest cut; buyer can change sort).

**Turn off band / −% badges:** `enabled: false`, or `NITI_PROMO_ENABLED=false`, then restart. Force on: `NITI_PROMO_ENABLED=true` (ignores end date).

**Local preview:** `previewWhenEmpty` (development only) fills sample crossed prices when the catalog has none. Production ignores it.

---

## 4. Tekstil za svaki prostor (Shop by room)

**Component:** `CollectionsGrid`  
**Purpose:** Main discovery. This is the **broad category layer**.

**What is shown:** exactly **6 rooms**, never 7 leftover leaf cards.

Desktop mosaic:
- Row 1: 2 large tiles — Spavaća soba, Kupatilo
- Row 2: 4 tiles — Kuhinja, Dnevna soba, Dečiji program, Hotelski program

Tiles are **sharp-cornered** (gallery), not rounded app cards — they match product frames.

Mobile: horizontal snap of the same 6 rooms.

**Click target:** `/shop/{room-id}` e.g. `/shop/spavaca-soba`  
That page shows a compact hero, text filters for categories, then products — not a second photo grid of the same categories.

**Why not Posteljine / Čaršavi / Ćebad as homepage cards:**
- Those are *siblings inside the bedroom*, not equal to “Kupatilo”
- Mixing levels (room vs product type) makes the grid feel random
- 7 cards (6+1) leave an empty second row — looks unfinished

**Images:** room images live on `CATEGORY_GROUPS` in `store-categories.ts` (Shopify collection images can replace these later).

---

## 5. Featured editorial (Istaknuti komfor)

**Component:** `FeaturedHero`  
**Purpose:** Slow the scroll. One strong story + one CTA. Brand, not catalog.

**Logic:** Currently bedroom-focused. CTA goes to `/shop/spavaca-soba` (the room), not a mock product.

**Why here:** Between discovery and lifestyle video — a pause that feels premium.

---

## 6. Gde dizajn oživljava

**Component:** `DesignCarousel`  
**Purpose:** Lifestyle / product in use. Video + product card that links to a **real** product page.

**Config:** `src/config/design-showcase.ts`  
**Logic:** Each slide has `productHandle`. Title, price, thumb come from Shopify. Missing handles fall back to catalog products.

**Why here:** Emotional proof after rooms. Not for navigation — for desire.

---

## 7. FAQ

**Component:** `FaqSection`  
**Purpose:** Trust before footer (materials, shipping, returns).

---

## 8. Footer

**Shop column:** the **6 rooms** + “Svi proizvodi” — not 16 leaf categories stacked in one tall list.

**Why:** Footer is wayfinding, not a sitemap dump. Rooms keep height compact and match the rest of the site.

---

## What we do *not* show on the homepage

| Avoid | Reason |
|--------|--------|
| All 16 leaf categories as equal cards | Wrong hierarchy; ugly leftover row |
| 16 filter pills on New arrivals | Clutter; use rooms |
| Internal types (lastiš, nepromočivi, TDF) | Filters later, not destinations |
| Mock product CTAs | Breaks trust when Shopify is live |
| Countdown clocks, stock fibs, “mega sale” | Cheapens the brand; urgency only if `endsOn` is a real last day |
| A was-price we did not charge | Compare-at in Shopify must be a real previous price |

---

## Related routes

| URL | What the user sees |
|-----|-------------------|
| `/shop` | All products + room strip |
| `/shop?snizeno=1` | Discounted products only, steepest cut first |
| `/shop/spavaca-soba` | Room landing: subcategory cards + products |
| `/shop/carsavi` | Leaf category inside that room |
| `/product/[handle]` | Product page |

---

## Files to edit when changing homepage story

- Section order: `src/app/page.tsx`
- Rooms & copy: `src/config/store-categories.ts`
- Hero media: `src/config/hero-slides.ts`, `src/config/hero.ts`
- Showcase videos: `src/config/design-showcase.ts`
- Sale edit on/off, end date, collection: `src/config/promo.ts` (`NITI_PROMO_ENABLED` overrides it)
- This document: `HOME_PAGE.md`
