# NITI. — Website flow

How a customer should move through the store, what each step shows, and what we deliberately leave out.

Related:
- `HOME_PAGE.md` — homepage sections
- `CATEGORY_ARCHITECTURE.md` — rooms vs categories vs Shopify
- `brand/BRAND_BRIEF.md` — visual and verbal identity

---

## The idea

Shop like a home, not like a warehouse.

1. Feel the brand
2. Pick a **room**
3. Narrow to a **category** (optional)
4. Open a **product**
5. Cart → Shopify checkout

Never show the same choice twice in a row.  
If the shopper already picked Spavaća soba, do not put a second photo grid of Posteljine / Čaršavi above the products — the text filters and the category name on each card are enough.

---

## Map

```
Početna  /
  │
  ├─ Prodavnica (header mega menu)
  │     6 rooms → categories under each
  │
  ├─ Room          /shop/spavaca-soba
  │     compact hero
  │     text links to other rooms
  │     text filters for categories in this room
  │     product grid (category name on each card)
  │
  ├─ Category      /shop/carsavi          ← optional
  │     compact hero
  │     sibling categories in the same room
  │     products of that type
  │
  ├─ All products  /shop
  │     title + room text links + full catalog
  │
  └─ Product       /product/[handle]
        gallery, options, add to cart
        related / recently viewed
        text links back to category, room, shop
              │
              └─ Cart /cart → Shopify checkout
```

---

## Step by step

### 1. Home `/`

| Section | Job | What the user does |
|---------|-----|-------------------|
| Hero | Mood + brand | Watch, then shop or browse |
| Novo u ponudi | What’s new | Filter by **room**, tap a product |
| Tekstil za svaki prostor | Main map of the store | Tap a **room** |
| Istaknuti komfor | Editorial pause | Continue into the bedroom |
| Gde dizajn oživljava | Lifestyle / desire | Tap a product |
| FAQ | Trust | Read, then footer |

Homepage rooms are **sharp image tiles** (gallery), not rounded app cards.  
They go to `/shop/spavaca-soba` etc. — never to 16 equal category cards.

### 2. Room `/shop/spavaca-soba`

This is the main catalog destination after the homepage.

**Keep**
- Compact photo hero with dark scrim (readable white type) + breadcrumb
- One category strip labeled for this room (Sve · Posteljine · Čaršavi…) — same links as the mega menu
- Product grid (everything in the room)

**Do not keep**
- A second row of large subcategory photos
- Two nearly identical uppercase nav rows (rooms + categories) stacked — breadcrumb already shows the room

Clicking a category (e.g. Stolnjaci) always goes to `/shop/stolnjaci` — from the room strip or from Prodavnica. Same page, same layout.

### 3. Category `/shop/carsavi` (optional)

Used when the shopper already knows the type — from the mega menu or from a room’s category strip. Same page either way.

- Same hero treatment + breadcrumb (Početna / Prodavnica / Kuhinja / Stolnjaci)
- One underline category strip (siblings) — not a second room row
- Products of that type only

Breadcrumb: Početna / Prodavnica / Spavaća soba / Čaršavi

### 4. All products `/shop`

- Title
- Room strip (only place that lists all rooms as chips)
- Full catalog

### 5. Product `/product/[handle]`

- Gallery (sharp frames)
- Options, add to cart
- Related / recently viewed
- Quiet text: Nastavi kupovinu → category · room · svi proizvodi

No mosaic of every category at the bottom of the product page.

### 6. Cart `/cart` → Shopify checkout

---

## What stays where

| Customer sees | Lives in Shopify / later filters |
|---------------|----------------------------------|
| 6 rooms (homepage, footer, mega menu headers) | Fitted / waterproof sheets |
| ~16 public categories (under a room) | Beach towels as a type |
| Category name on product cards | TDF, hotel SKU lines |
| Size / color on the product | Material, waterproof, kids as filters later |

**Homepage and footer:** rooms only.  
**Mega menu:** rooms as column titles, categories as text under them.  
**Room page:** products + text category filters.  
**Category page:** products of that type.

Do not put all 16 categories as equal image cards on the homepage, the room page, or the product page.

---

## Visual language

Premium textile, not trendy UI.

- **Images / tiles / gallery:** sharp corners (`rounded-none`)
- **Product cards:** photo + category + title + price — no padded white frame, no lift-on-hover
- **Filters / room nav:** uppercase text + underline, not round pills
- **Buttons / inputs:** small radius (`rounded-md`) is fine
- **Status (Novo, sale, cart count):** small labels are OK — they are status, not architecture
- **Mega menu / mobile menu:** typography and rules, not rounded white cards

---

## Files

| Flow piece | File |
|------------|------|
| Home rooms | `src/components/home/CollectionsGrid.tsx` |
| Shop hero | `src/components/shop/ShopHero.tsx` |
| Room page | `src/components/shop/GroupPageLayout.tsx` |
| Category page | `src/components/shop/CategoryPageLayout.tsx` |
| Room strip (`/shop` only) | `src/components/shop/RoomNavStrip.tsx` |
| Category strip (links to `/shop/{slug}`) | `src/components/shop/CategoryNavStrip.tsx` |
| Product card | `src/components/shop/ProductCard.tsx` |
| Mega menu | `src/components/layout/NavMegaMenu.tsx` |
| Taxonomy | `src/config/store-categories.ts` |
