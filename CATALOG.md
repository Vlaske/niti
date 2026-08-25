# NITI. — Katalog i kategorije

Ovaj dokument opisuje **kako podesiti Shopify** da pokriva istu ponudu kao [viktorijaleskovac.rs](https://www.viktorijaleskovac.rs/), ali sa **čistijom i više customer-friendly strukturom**.

Za punu logiku slojeva i merge odluka vidi:
`CATEGORY_ARCHITECTURE.md`

---

## Struktura (6 grupa, pojednostavljena javna navigacija)

| Grupa | Kategorije (Shopify collection handle) |
|-------|----------------------------------------|
| **Spavaća soba** | `posteljine`, `carsavi`, `jastuci-i-jastucnice`, `jorgani-i-prekrivaci`, `cebad`, `nadduseci` |
| **Kupatilo** | `peskiri`, `bade-mantili`, `kupatilski-setovi`, `prostirke` |
| **Kuhinja** | `stolnjaci`, `kuhinjske-krpe`, `kecelje` |
| **Dnevna soba** | `dekorativni-tekstil` |
| **Dečiji program** | `deciji-program` |
| **Hotelski program** | `hotelski-program` |

**Izvor konfiguracije:** `src/config/store-categories.ts`

**URL na sajtu:** `/shop/{slug}` — npr. `/shop/peskiri`

---

## Istaknute kategorije (početna)

Na sekciji „Istražite kolekcije“ prikazuju se kategorije sa `featured: true`:

- Posteljine, Čaršavi, Jastuci i jastučnice, Jorgani i prekrivači, Ćebad, Peškiri, Bade mantili

---

## Shopify Admin — korak po korak

### 1. Napravi kolekcije (Automated ili Manual)

Za **svaku javnu kategoriju** iz tabele:

1. **Products → Collections → Create collection**
2. **Title:** npr. „Peškiri“ (srpski, kako želiš na sajtu)
3. **Handle:** **mora** tačno da odgovara koloni iz tabele (npr. `peskiri`, `jorgani-i-prekrivaci`)
4. Dodaj sliku kolekcije (hero na kategorijskoj stranici)
5. **Products:** dodaj proizvode ručno ili uslovima (tag, tip, vendor…)

Opcionalno:
- zadrži dodatne **interne kolekcije** za organizaciju (`carsavi-lastis`, `plazni-peskiri`, `ukrasne-jastucnice`…)
- ali ih nemoj nužno prikazivati kao glavni nivo navigacije

> Handle proveri u Admin-u: URL kolekcije je `.../collections/peskiri` → handle = `peskiri`

### 2. Proizvodi

Svaki proizvod iz Viktorija ponude:

1. **Products → Add product**
2. Naslov, opis, slike, cena (RSD)
3. Varijante (dimenzija, boja) ako postoje
4. **Collections:** označi sve relevantne kolekcije (proizvod može biti u više kolekcija)

**Primer:** „Peškir ClasSic Soft 70x140cm Cream“ → kolekcija `peskiri`, opciono dodatni tag/sekundarna kolekcija za tip proizvoda

### 3. Mapiranje Viktorija → NITI handle

| Viktorija (primer putanje) | NITI slug / Shopify handle |
|-----------------------------|----------------------------|
| `/kupatilo/peskiri-kupatilo/` | `peskiri` |
| `/kupatilo/plazni-peskiri/` | `peskiri` *(filter / secondary collection)* |
| `/kupatilo/bade-mantili/` | `bade-mantili` |
| `/spavaca-soba/carsavi/` | `carsavi` |
| `/spavaca-soba/carsavi-lastis/` | `carsavi` *(filter / secondary collection)* |
| `/spavaca-soba/carsavi-nepromocivi/` | `carsavi` *(filter / secondary collection)* |
| `/spavaca-soba/posteljine/` | `posteljine` |
| `/spavaca-soba/jastuci/` + `/jastucnice/` | `jastuci-i-jastucnice` |
| `/spavaca-soba/jorgani/`, `/prekrivaci/`, `/frotirni-prekrivaci/`, `/step-deke/` | `jorgani-i-prekrivaci` |
| `/spavaca-soba/cebad/` | `cebad` |
| `/dnevna-soba/ukrasne-jastucnice/` + `/prekrivaci-tdf/` | `dekorativni-tekstil` |
| `/kuhinja/stolnjaci/` | `stolnjaci` |
| `/deciji-program/` | `deciji-program` |
| `/hotelski-program/` | `hotelski-program` |

---

## Workflow uvoza proizvoda

1. **Lista proizvoda** — Excel/CSV iz Viktorija ili ručno sa njihovog sajta
2. **Shopify bulk** — CSV import ([Shopify CSV template](https://help.shopify.com/en/manual/products/import-export))
3. **Proveri handle kolekcija** — moraju matchovati `store-categories.ts`
4. **Deploy / refresh** — sajt automatski vuče kolekcije (revalidate 60s)
5. **Test** — otvori `/shop/peskiri`, proveri broj proizvoda i slike

---

## Dodavanje nove kategorije

1. U `src/config/store-categories.ts` dodaj objekat sa `slug`, `collectionHandle`, `group`, `title`, `description`
2. Napravi kolekciju u Shopify sa istim handle-om
3. Push na GitHub → Vercel deploy

Ne moraš dirati komponente — navigacija, mega meni i rute se generišu iz config-a.

---

## Napomene

- **Mock podaci** (`src/lib/data/products.ts`) su fallback dok Shopify nije povezan — služe samo za test layouta.
- **Broj proizvoda** na karticama dolazi iz Shopify API-ja (do 250 po kolekciji u trenutnom query-ju).
- Za **2000+ proizvoda** kasnije: cursor paginacija u `fetchShopifyProductsByCategory` i shop grid.

---

## Reference

- Viktorija katalog: https://www.viktorijaleskovac.rs/
- Shopify setup: `SHOPIFY_SETUP.md`
- Kategorije u kodu: `src/config/store-categories.ts`
