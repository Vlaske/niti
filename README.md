# NITI. — Premium Home Textiles

Production-ready Next.js storefront for **NITI.** — pastel-toned bedsheets, towels, and home textiles. Built with GSAP animations and structured for Shopify Headless integration.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **GSAP** + ScrollTrigger
- **Shopify Storefront API** (placeholder client in `src/lib/shopify/`)

## Getting started

```bash
cd niti-store
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — hero carousel, new arrivals, collections, design carousel, FAQ |
| `/shop` | Full catalog with category filters |
| `/shop/[category]` | Category listing with hero banner |
| `/product/[handle]` | Product detail with gallery and add to cart |
| `/cart` | Cart and order summary |
| `/search` | Search placeholder (Shopify-powered later) |
| `/account` | Account placeholder |

## Shopify integration

Copy `.env.example` to `.env.local` and add your Storefront API credentials. Replace mock data in `src/lib/data/` with queries from `src/lib/shopify/client.ts`.

## Project structure

```
src/
  app/              # Routes
  components/       # UI, layout, home, shop, product, cart
  context/          # Cart state (client-side until Shopify cart API)
  lib/data/         # Mock products & collections
  lib/shopify/      # Storefront API client stub
```
