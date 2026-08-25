# NITI. Category Architecture

This document is the source of truth for how the catalog is organized.

It explains:
- what customers see on the site
- how we intentionally simplified the source catalog
- what belongs in navigation vs filters vs internal Shopify structure
- which Shopify collections/handles we need

---

## 1. Category layers

We are using a **3-layer catalog model**, plus a **room layer** for navigation.

### Layer 0: Rooms (homepage + mega menu + footer)
The first thing a customer chooses: *which part of the home?*

- Spavaća soba → `/shop/spavaca-soba`
- Kupatilo → `/shop/kupatilo`
- Kuhinja → `/shop/kuhinja`
- Dnevna soba → `/shop/dnevna-soba`
- Dečiji program → `/shop/deciji-program`
- Hotelski program → `/shop/hotelski-program`

Homepage “Tekstil za svaki prostor” shows **only these 6 rooms** (2 large + 4 compact).  
It must not mix rooms with leaf categories (Posteljine, Ćebad…) — that is a different level.

**Room page** (`/shop/spavaca-soba`) is a product destination:
- compact hero
- text links to other rooms
- text filters for categories in that room
- product grid (each card shows its category name)

It must **not** also show a large photo grid of the same subcategories. That repeats the filters and the card labels.

### Layer 1: Customer-facing categories
Inside a room. Example: in Spavaća soba → Posteljine, Čaršavi, Jastuci i jastučnice…

Current public categories live in:
`src/config/store-categories.ts`

### Layer 2: Internal Shopify collections
This is where we preserve more specific source-site distinctions.

Examples:
- `carsavi-lastis`
- `carsavi-nepromocivi`
- `plazni-peskiri`
- `ukrasne-jastucnice`
- `prekrivaci-tdf`

These may exist in Shopify for organization, imports, merchandising, or filtering,
but they should usually **not** become separate main navigation categories.

### Layer 3: Filters / product attributes
These help customers narrow down products inside a category.

Examples:
- size
- color
- material
- waterproof
- fitted / flat
- beach / hotel / kids
- pattern / style

Rule:
- **Category** = what the shopper thinks they want
- **Filter** = a product detail
- **Internal collection** = an admin / merchandising grouping

---

## 2. Final public taxonomy

This is the current recommended storefront structure.

### Spavaća soba
- `posteljine`
- `carsavi`
- `jastuci-i-jastucnice`
- `jorgani-i-prekrivaci`
- `cebad`
- `nadduseci`

### Kupatilo
- `peskiri`
- `bade-mantili`
- `kupatilski-setovi`
- `prostirke`

### Kuhinja
- `stolnjaci`
- `kuhinjske-krpe`
- `kecelje`

### Dnevna soba
- `dekorativni-tekstil`

### Dečiji program
- `deciji-program`

### Hotelski program
- `hotelski-program`

---

## 3. Merge decisions we made

These are intentional UX improvements over the source catalog.

### Merged into `carsavi`
- `carsavi`
- `carsavi-lastis`
- `carsavi-nepromocivi`

Why:
Customers usually first think “I need a sheet,” then choose fitted/waterproof later.

### Merged into `jastuci-i-jastucnice`
- `jastuci`
- `jastucnice`

Why:
They are strongly related and often bought together.

### Merged into `jorgani-i-prekrivaci`
- `jorgani`
- `prekrivaci`
- `frotirni-prekrivaci`
- `step-deke`

Why:
These are all “bed layers” in the customer’s mind.

### Merged into `peskiri`
- `peskiri`
- `plazni-peskiri`

Why:
Beach vs standard towel is better handled by filters or a subcollection.

### Merged into `prostirke`
- `prostirke`
- `rukavice-za-brisanje`

Why:
Small bath accessories do not deserve a top-level destination.

### Merged into `dekorativni-tekstil`
- `ukrasne-jastucnice`
- `prekrivaci-tdf`

Why:
Both belong to decorative living-room textile.

### Merged into `deciji-program`
- `decija-cebad`
- `deciji-jastuci`
- `decije-jastucnice`
- `decija-posteljina`

Why:
Parents usually shop by “kids/baby” first, then refine.

---

## 4. Shopify collection strategy

For every **public category**, create a matching Shopify collection handle.

Examples:
- public category `carsavi` -> Shopify collection handle `carsavi`
- public category `peskiri` -> Shopify collection handle `peskiri`
- public category `dekorativni-tekstil` -> Shopify collection handle `dekorativni-tekstil`

In addition, we may also keep **secondary internal collections** for organization.

Example:
- public category: `carsavi`
- internal collections: `carsavi-lastis`, `carsavi-nepromocivi`

That means:
- customer navigates to `/shop/carsavi`
- product can still be tagged/assigned internally as fitted or waterproof

---

## 5. Featured categories

Homepage and featured navigation should stay selective.

Current featured categories:
- `posteljine`
- `carsavi`
- `jastuci-i-jastucnice`
- `jorgani-i-prekrivaci`
- `cebad`
- `peskiri`
- `bade-mantili`

These are the strongest “entry points” for discovery.

---

## 6. Files to update when taxonomy changes

### Main source of truth
- `src/config/store-categories.ts`

### Related docs
- `CATALOG.md`
- `SHOPIFY_SETUP.md`
- `SITE_FLOW.md` — customer journey and what each page shows
- this file: `CATEGORY_ARCHITECTURE.md`

### UI that reads taxonomy automatically
- header / mobile menu
- mega menu
- homepage collections
- category routes
- category nav strip

Because the site reads config centrally, changing the taxonomy should mostly be a
config/doc task, not a component rewrite.

---

## 7. Future notes

If the catalog grows a lot, we should next add:
- filter schema by category
- product type / material / size filters
- maybe separate “B2B / Hotelski program” landing flow
- maybe “Novo”, “Najprodavanije”, “Sezonsko” as curated collections

But we should avoid going back to 25+ equal-weight nav categories unless data
proves customers really need that.
