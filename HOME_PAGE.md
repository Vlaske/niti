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

## 3. Tekstil za svaki prostor (Shop by room)

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

## 4. Featured editorial (Istaknuti komfor)

**Component:** `FeaturedHero`  
**Purpose:** Slow the scroll. One strong story + one CTA. Brand, not catalog.

**Logic:** Currently bedroom-focused. CTA goes to `/shop/spavaca-soba` (the room), not a mock product.

**Why here:** Between discovery and lifestyle video — a pause that feels premium.

---

## 5. Gde dizajn oživljava

**Component:** `DesignCarousel`  
**Purpose:** Lifestyle / product in use. Video + product card that links to a **real** product page.

**Config:** `src/config/design-showcase.ts`  
**Logic:** Each slide has `productHandle`. Title, price, thumb come from Shopify. Missing handles fall back to catalog products.

**Why here:** Emotional proof after rooms. Not for navigation — for desire.

---

## 6. FAQ

**Component:** `FaqSection`  
**Purpose:** Trust before footer (materials, shipping, returns).

---

## 7. Footer

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

---

## Related routes

| URL | What the user sees |
|-----|-------------------|
| `/shop` | All products + room strip |
| `/shop/spavaca-soba` | Room landing: subcategory cards + products |
| `/shop/carsavi` | Leaf category inside that room |
| `/product/[handle]` | Product page |

---

## Files to edit when changing homepage story

- Section order: `src/app/page.tsx`
- Rooms & copy: `src/config/store-categories.ts`
- Hero media: `src/config/hero-slides.ts`, `src/config/hero.ts`
- Showcase videos: `src/config/design-showcase.ts`
- This document: `HOME_PAGE.md`
