# NITI. — Launch checklist

What must be true before production, what we already improved, and what’s still on you (business / Shopify).

Related: `SITE_FLOW.md`, `SHOPIFY_SETUP.md`, `HOSTING.md`, `PRODUCT_IMPORT.md`

---

## Done in the storefront (code)

- [x] Room → category → product → cart flow
- [x] Search overlay (as-you-type rooms / categories / products) — no dead `/search` stub
- [x] Account icon removed from header until Customer Accounts; `/account` explains “uskoro”
- [x] Hero focused on **rooms/categories**; first slide brand **NITI.** in Playfair
- [x] FAQ / value props / featured copy aligned with home textiles
- [x] Legal/care pages: `/dostava`, `/povrati`, `/nega`, `/privatnost`, `/uslovi`
- [x] Footer links point to those pages (no `#` for care/legal)
- [x] `sitemap.xml` + `robots.txt` + `metadataBase`
- [x] Mega menu “Novo u ponudi” icon + badge restored
- [x] Room mosaic hover polish

---

## Before you flip DNS / go live

### Shopify (blocker)

1. Live store + Storefront API token with cart/checkout scopes  
2. `NEXT_PUBLIC_SHOPIFY_ENABLED=true` + env vars (see `.env.example`)  
3. Confirm checkout opens (not password page) — `SHOPIFY_SETUP.md`  
4. Collections mapped to `src/config/store-categories.ts` handles  
5. Import catalog (`PRODUCT_IMPORT.md`) — don’t launch on Unsplash mock forever  

### Content / ops

6. Real phone, email, address in footer  
7. Newsletter wired (Klaviyo / Shopify / Formspree) — form is UI-only today  
8. Replace Unsplash room/hero images with your photography where possible  
9. Lawyer review of privacy / terms (pages are honest drafts)  
10. Decide shipping rules in Shopify — free-shipping claims are currently off in the UI until confirmed  
11. Confirm newsletter coupon copy matches a real offer  

### Hosting

12. Set `NEXT_PUBLIC_SITE_URL=https://your-domain`  
13. Deploy per `HOSTING.md` (Vercel / App Hosting / etc.)  
14. Smoke test: home → Spavaća soba → product → cart → checkout  

### Nice-to-have (post-launch OK)

- Shopify Customer Accounts (then show account icon again)
- Size / material filters on room pages
- JPG/PNG OG image (SVG is weak on some networks)
- Analytics (Plausible / GA4)
- `prefers-reduced-motion` pass on GSAP

---

## Search UX decision

**Header overlay** (implemented): type → live rooms, categories, products.  
Better for textile shoppers than a separate empty search page.  
`/search` redirects home; icon opens the overlay.

## Account UX decision

Not needed for v1 if Shopify guest checkout works.  
We hid the header icon so it doesn’t look broken. Re-enable when Customer Accounts is ready.
