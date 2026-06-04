# NITI. Store — Session Hand-off Document

**Project path:** `C:\Users\Luka-PC\niti-store`  
**Last verified:** Production build passes (`npm run build`)  
**Purpose of this doc:** Continue development in a new chat without losing context.

---

## 1. What We Are Building

A **production-ready, premium e-commerce storefront** for the brand **NITI.** (always written in all caps with a trailing dot: `NITI.`).

### Product focus
- Home textiles: bedsheets, towels, throws, accessories
- Pastel, Scandinavian-inspired, “quiet luxury” aesthetic
- Target market: **Serbia first** (Serbian UI, **RSD** pricing)

### Business / backend goal
- **Shopify Headless** (Storefront API) for products, collections, cart, and checkout
- **Current state:** Frontend is built with **mock data**; Shopify client stub exists but is **not wired**

### Design references
The user provided multiple screenshots (ROOMIO-style furniture references) adapted for NITI:
- Full-bleed hero with transparent header, large headline, CTAs bottom-left
- “New arrivals” with filter pills + horizontal product carousel
- “Explore collections” image grid
- “Where design comes alive” lifestyle product carousel with play buttons
- Value props + newsletter + dark footer
- FAQ split layout (image + accordion)
- Category page: dark/image hero, breadcrumbs, floating category strip, product grid
- Product cards: white “frame” around image (gallery/mat look), hover quick-view + add to cart
- Mobile must look **excellent** — non-negotiable

---

## 2. Tech Stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | GSAP + ScrollTrigger |
| Icons | lucide-react |
| Fonts (Google) | **Playfair Display** (serif, logo/headlines), **Plus Jakarta Sans** (UI) — both `latin` + `latin-ext` for Serbian |
| Backend (planned) | Shopify Storefront API |
| Package manager | npm |

---

## 3. Key Product & UX Decisions (Do Not Undo Without Asking)

### Brand & language
- Default language: **Serbian (`sr`)**
- Optional English via header toggle (`SR` / `EN`) — stored in `localStorage` key `niti-locale`
- Translations: `src/lib/i18n/translations.ts` + `useLanguage()` hook

### Currency
- **All prices in RSD** (integer amounts in mock data, e.g. `20900` = 20.900 RSD)
- `formatPrice()` in `src/lib/utils.ts` uses `Intl.NumberFormat` with `currency: "RSD"`, no decimals
- Free shipping threshold in copy: **13.000 RSD**

### Navigation
- **Removed duplicate “Kolekcije” top-level nav** — it duplicated “Prodavnica”
- Single **“Prodavnica”** mega-menu dropdown:
  - Left: “Svi proizvodi”, “Novo u ponudi” (with New badge), link to FAQ
  - Right: 4 category image cards
- Mega-menu must be **full header width** (`absolute left-0 right-0` on header) — was broken when nested only under the nav link
- **Removed compare/scale icon** from header and floating actions (user did not want it)
- Floating action: **scroll-to-top only** (sage green button)

### Hero
- Supports **images and video** (`HeroSlide.mediaType`, `mediaSrc`, `poster`)
- Video files go in `public/videos/` — see `public/videos/README.md`
- `src/config/hero.ts`: `singleVideoLoop: true` = one slide, loop forever, hide carousel controls
- Hero copy in `heroSlides` is Serbian; CTAs use i18n keys in component

### Marquee text strip
- **Disabled on homepage** (commented out in `src/app/page.tsx`)
- Component kept in `src/components/home/MarqueeBanner.tsx` with slower/thicker styling for future enable

### Animations
- GSAP scroll reveals via `useScrollReveal` in `src/lib/animations.ts`
- **Route change reset:** `RouteAnimationReset` kills ScrollTrigger on pathname change (fixes “animation already finished” when navigating back to home)
- Cart add: toast (`CartToast`) + badge pop animation
- Product card hover: lift, shadow, quick view + add to cart overlay

### Cart
- **Client-side only** (`CartContext`) — not persisted, not Shopify yet
- Toast on add, subtotal in header

### Recently viewed
- `RecentlyViewedContext` — `localStorage` key `niti-recently-viewed`, max 8 items
- Shown on product page below main content

### Product cards
- White frame/padding around image (reference: “Polaroid” gallery look)
- `product-card` hover lift in CSS
- Serbian “Od X RSD” for prices ≥ 10.000

### Category pages
- Full-width **category image hero** (not solid black) with gradient to cream
- `CategoryNavStrip` — horizontal scrollable white pill bar overlapping hero
- `CategoryPageLayout` wraps header (transparent on hero) + shop grid

### Shop page (`/shop`)
- Simple title band + `CategoryNavStrip` + `ShopPageClient` with filters, sort, pagination (“Učitaj još”, 8 per page)

### Placeholder pages
- `/search`, `/account` — UI shells only, mention Shopify later

---

## 4. What Has Been Accomplished

### ✅ Scaffolding
- Next.js 16 project at `niti-store`, git initialized
- Dependencies: gsap, lucide-react, clsx
- `next.config.ts` — remote images: `images.unsplash.com`, `cdn.shopify.com`

### ✅ Pages (routes)
| Route | Status |
|-------|--------|
| `/` | Landing: hero carousel, new arrivals, collections, featured hero, design carousel, FAQ, footer |
| `/shop` | All products + category strip |
| `/shop/[category]` | Category hero + strip + filtered grid (`bedsheets`, `towels`, `throws`, `accessories`, `linen`) |
| `/product/[handle]` | PDP: gallery, details, also like, recently viewed, categories |
| `/cart` | Cart + order summary |
| `/search` | Placeholder |
| `/account` | Placeholder |

### ✅ Components (high level)
- Layout: `Header`, `Footer`, `NavMegaMenu`, `PageShell`, `FloatingActions`, `NewsletterForm`
- Home: `HeroCarousel`, `NewArrivals`, `CollectionsGrid`, `FeaturedHero`, `DesignCarousel`, `MarqueeBanner` (disabled), `FaqSection`
- Shop: `ProductCard`, `ShopPageClient`, `CategoryPageLayout`, `CategoryNavStrip`
- Product: `ProductGallery`, `ProductDetails`, `ProductPageView`
- Cart: `CartContent`, `CartPageTitle`
- UI: `Button`, `SectionHeader`, `CarouselControls`, `FilterPills`, `ColorSwatches`, `CartToast`
- Providers: `AppProviders`, `RouteAnimationReset`

### ✅ Context / state
- `CartContext` — items, subtotal, toast
- `LanguageContext` — sr/en
- `RecentlyViewedContext` — localStorage

### ✅ Mock data
- `src/lib/data/products.ts` — 8 products, prices in RSD
- `src/lib/data/categories.ts` — 4 categories, Serbian titles
- `src/lib/data/collections.ts` — hero slides, design carousel, FAQ, value props

### ✅ Docs
- `README.md` — basic run instructions
- `SHOPIFY_SETUP.md` — step-by-step Shopify credentials (Serbian)
- `HANDOFF.md` — this file

### ✅ Build
- `npm run build` succeeds (static/SSG pages)

---

## 5. Current Codebase Structure

```
niti-store/
├── public/videos/README.md          # How to add hero videos
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Fonts, AppProviders
│   │   ├── page.tsx                 # Home (Marquee commented out)
│   │   ├── globals.css              # NITI tokens, .interactive cursor, product-card
│   │   ├── shop/page.tsx
│   │   ├── shop/[category]/page.tsx
│   │   ├── product/[handle]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── search/page.tsx
│   │   └── account/page.tsx
│   ├── components/                  # layout, home, shop, product, cart, ui, providers
│   ├── config/hero.ts
│   ├── context/                     # Cart, Language, RecentlyViewed
│   ├── lib/
│   │   ├── animations.ts
│   │   ├── utils.ts                 # cn, formatPrice (RSD)
│   │   ├── i18n/translations.ts
│   │   ├── data/                    # mock products, categories, collections
│   │   └── shopify/client.ts        # STUB — not used in UI yet
│   └── types/index.ts
├── .env.example
├── SHOPIFY_SETUP.md
└── HANDOFF.md
```

---

## 6. Design Tokens (CSS variables in globals.css)

- Cream background: `#faf7f2`
- Sage accent: `#b8cfc0` (buttons, badges)
- Charcoal text: `#2a2826`
- Footer: `#5c5348`
- Sale red: `#c97b7b`

Use class names like `bg-niti-cream`, `text-niti-charcoal`, `bg-niti-sage`.

Interactive elements should use class **`interactive`** for pointer + transitions (global CSS also sets cursor on `a`, `button`, etc.).

---

## 7. What Still Needs To Be Done (Priority Order)

### P0 — Shopify integration
1. User creates `.env.local` per `SHOPIFY_SETUP.md` (never commit tokens)
2. Implement Storefront API queries: products, collections, product by handle
3. Replace mock data in pages with real data (or hybrid during migration)
4. **Shopify Cart API** — replace client-only `CartContext` with Storefront cart + checkout URL
5. Wire “Checkout with Shopify” button on cart page
6. Configure markets/currency in Shopify Admin (RSD for Serbia)

### P1 — Content & assets
1. Replace Unsplash placeholders with brand photography
2. Add hero **video** if user has bedsheet footage (`public/videos/` + slide config)
3. Serbian product titles/descriptions in Shopify or hardcoded mapping
4. Real contact info in footer (currently placeholder Belgrade phone)

### P2 — UX polish (user may still want)
1. Re-enable marquee if desired — uncomment in `page.tsx`
2. Mega-menu: user may want further visual tweaks vs latest screenshot
3. Product names still English in mock data — translate to Serbian
4. Search page — implement storefront search query
5. Account — Customer Account API or Shopify login
6. Filter/pagination when on Shopify — collection-based filtering, cursor pagination
7. SEO: metadata per locale, Open Graph images
8. `generateStaticParams` may need ISR/on-demand when using Shopify

### P3 — Production
1. Deploy (Vercel recommended for Next.js)
2. Env vars on hosting
3. Domain + Shopify custom domain / headless routing
4. Analytics, cookie consent if EU/Serbia requires

---

## 8. Shopify — What the User Must Provide

**Do not ask for API keys in chat.** User should create `.env.local`:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=their-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_...
```

Full click-by-click: **`SHOPIFY_SETUP.md`**

When ready, user can say: store domain is ready (no token in chat).

---

## 9. How to Run Locally

```bash
cd C:\Users\Luka-PC\niti-store
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm run build   # verify before deploy
```

---

## 10. User Feedback History (Important Constraints)

1. **Mobile-first** — every section must work on phone
2. **Pointer cursor** on everything clickable (hero controls, swatches, cart, etc.)
3. **No compare/scale icon**
4. **Pastel, premium, professional** — not dark furniture store; adapted from ROOMIO refs
5. **Animations** should replay correctly on navigation (fixed with RouteAnimationReset)
6. **Serbian primary**, English optional
7. **RSD only** for prices
8. Category page hero = **category image**, not black block
9. Product cards = **framed** look (user liked idea, border slightly thinner than early mock)
10. Single “Prodavnica” menu — collections inside mega-menu, not duplicate nav item

---

## 11. Known Limitations / Technical Notes

- Cart does not persist on refresh
- `designCarouselItems` prices/descriptions still partly English in `collections.ts`
- Product titles in `products.ts` are English (display strings)
- Hero slide `ctaPrimary.label` in data uses placeholder `"view"` — component uses i18n for button text
- `linen` category is special-cased in `[category]/page.tsx` (filters products by `collection === "linen"`)
- Header `megaOpen` sets cream background on hero pages — intentional for readability
- English locale still formats RSD (`en-RS`) — may want EUR display for EN later

---

## 12. Files to Touch First in Next Session

| Task | Likely files |
|------|----------------|
| Shopify products | `src/lib/shopify/`, new `queries.ts`, product pages |
| Shopify cart | `CartContext.tsx`, `cart/page.tsx`, `CartContent.tsx` |
| Translate products | `products.ts` or Shopify fields |
| Hero video | `collections.ts` heroSlides, `public/videos/`, `config/hero.ts` |
| Enable marquee | `app/page.tsx`, `MarqueeBanner.tsx` |
| Nav tweaks | `Header.tsx`, `NavMegaMenu.tsx` |

---

## 13. Reference Images Location

User screenshots were saved under Cursor workspace assets, e.g.:

`C:\Users\Luka-PC\.cursor\projects\c-Users-Luka-PC-niti-store\assets\`

(Filenames vary per message; search `assets` for `image-*.png` if needed.)

---

## 14. One-Line Summary for New Agent

**NITI. is a Serbian-language, RSD-priced, pastel home-textiles Next.js 16 storefront with GSAP animations and a complete mock UI (landing, shop, categories, PDP, cart); Shopify Headless is planned but not connected—next step is Storefront API + real cart/checkout, then real assets and content.**
