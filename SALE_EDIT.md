# NITI. — Sale edit (Sniženo)

How discounted products work on the storefront, how to turn the homepage band
on and off, and how to manage everything from Shopify Admin without fighting
the site.

---

## What buyers see

| Surface | When it appears | What it does |
|---------|-----------------|--------------|
| Homepage charcoal band | Master switch **on** + at least one real discount | Carousel of up to 12 deals, steepest cut first. CTA **Sva sniženja** |
| Menu + footer **Sniženo** | Any in-stock product has a real compare-at price | Links to `/shop?snizeno=1` (even if the homepage band is off) |
| `/shop?snizeno=1` | Same as menu | Full sale grid, default sort **Najveći popust** |
| −% badges on cards / PDP / search / cart | Master switch **on** | Percent floored; under 1% keeps dinar savings only |

If nothing in Shopify has a compare-at higher than the selling price, **nothing
sale-related appears** in production — no band, no menu link, no invented
“was” prices.

---

## Two switches (keep them separate)

### 1. Product is on sale → Shopify Compare-at price

This is the **source of truth**. The site never invents a previous price.

In Shopify Admin:

1. Open **Products** → the product → the **variant**.
2. Set **Price** to today’s selling price (RSD).
3. Set **Compare at price** to the previous price you actually charged.
4. Save. Publish the product on the **Headless** sales channel.

To take a product **off** sale: clear Compare-at (or set it ≤ Price). After the
next revalidate (~60s), it leaves the band, the sale page, and the menu count.

Honest rules the site enforces:

- Compare-at must be **strictly higher** than Price.
- Percent is **floored** (19.6% → 19%). We never round up.
- Out-of-stock and products without an image are skipped.

### 2. Homepage band + percent badges → config / env

File: `src/config/promo.ts`

| Field | Role |
|-------|------|
| `enabled` | `true` = charcoal band + −% badges. `false` = previous site look for badges; band unmounts |
| `endsOn` | Optional `YYYY-MM-DD` (Europe/Belgrade). Inclusive last day; countdown only when set. Day after → band off |
| `collectionHandle` | Default `akcija` — optional curated collection |
| `collectionOnly` | `true` = only that collection; empty = no sale UI until you add deals |
| `handles` | Pin specific handles when not using the collection |
| `maxProducts` | Homepage carousel cap (default **12**) |
| `previewWhenEmpty` | **Dev only** sample crossed prices when catalog has no compare-at. Never in production |

Hosting override (no redeploy of the config file needed if you set env):

```bash
NITI_PROMO_ENABLED=false   # kill band + percent badges immediately
NITI_PROMO_ENABLED=true    # force on (also ignores endsOn)
```

Restart the Node process after changing env. File `enabled` is enough for most
day-to-day toggles if you redeploy or run locally.

**Important:** turning `enabled` off hides the homepage band and percent-style
badges, but **Sniženo stays in the menu** as long as real compare-at products
exist — so buyers can still open the full sale list.

---

## Recommended day-to-day workflow

### Soft seasonal edit (most common)

1. In Shopify, set Compare-at on the variants you want reduced.
2. Keep `enabled: true` in `promo.ts` (or env on).
3. Leave `akcija` empty **or** unused — the site picks every discounted,
   in-stock product, steepest cut first.
4. Homepage shows up to 12; **Sva sniženja** shows all.
5. To end the season: clear Compare-at on those variants **or** set
   `enabled: false` if you want badges quiet while stock sells through.

### Curated “edit” (only certain pieces on the band)

1. Create a collection in Shopify with handle **`akcija`**
   (Products → Collections → Create; set the URL handle to `akcija`).
2. Add only the products that belong in the homepage edit.
3. Those products **must still have Compare-at > Price**.
4. If the collection has products but **none** are discounted, the band stays
   empty on purpose (no silent fallback to the rest of the catalog).
5. For a strict curated-only sale page too, set `collectionOnly: true`.

### Timed campaign

1. Set Compare-at prices in Shopify.
2. Set `endsOn: "2026-12-01"` (example) in `promo.ts`.
3. Homepage shows a countdown until end of that day in Belgrade.
4. The day after, the band turns off automatically. Clear Compare-at when the
   commercial offer actually ends so the menu / sale page stay honest.

### Emergency off

- `NITI_PROMO_ENABLED=false` on the host, restart — band and −% badges gone.
- Or clear all Compare-at prices — menu link disappears too once cache refreshes.

---

## Shopify Admin checklist

- [ ] Prices in **RSD**
- [ ] Compare-at is a **real previous** price (legal / trust)
- [ ] Product published to the **Headless** channel
- [ ] Optional: collection handle exactly `akcija`
- [ ] Optional: end date only if the offer truly ends that day
- [ ] Wait ~1 minute (or hard-refresh) after Admin saves — `revalidate = 60`

Do **not** rely on Shopify automatic “Sale” badges in the Online Store theme —
this headless site reads Storefront API compare-at fields only.

---

## Front-end map (for developers)

| Concern | Location |
|---------|----------|
| Switches & caps | `src/config/promo.ts` |
| Active / expired logic | `src/lib/promo-state.ts` |
| Product resolution + preview | `src/lib/promo.ts` (`getPromoEdit`) |
| Discount math | `src/lib/pricing.ts` |
| Homepage band | `src/components/home/SaleEdit.tsx` |
| Menu / footer visibility | `usePromoNav()` → `hasSale` |
| Percent badges elsewhere | `usePromo()` → `active` |
| Full sale listing | `/shop?snizeno=1` → `ShopPageClient` `saleOnly` |

Resolution order for which products count:

1. Collection `akcija` (if configured and returns products) → discounted only  
2. Else pinned `handles`, else whole catalog → discounted only  
3. Sort by floored percent, then dinar savings  
4. Homepage slices to `maxProducts`; shop sale view uses the full list  

---

## UX details (do not undo lightly)

- Homepage: horizontal snap carousel; mobile one card; desktop four across with
  arrows when there are more than four.
- Menu **Sniženo** mirrors **Novo u ponudi** (icon + **Akcija** tag).
- Mobile category accordion starts **closed** (no Spavaća soba open by default).
- No fake scarcity, no “MEGA SALE”, no countdown without a real `endsOn`.
- Brand voice: quiet, honest — see `brand/BRAND_BRIEF.md`.

---

## Local development

If the live catalog has no compare-at prices yet, `previewWhenEmpty: true`
fills a sample edit **only in development** so layout can be reviewed. As soon
as any real compare-at exists, samples disappear. Production never uses preview.

```bash
npm run dev
# Homepage band: http://localhost:3000/#snizeno
# Full list:     http://localhost:3000/shop?snizeno=1
```

---

## Related docs

- Homepage section order: `HOME_PAGE.md`
- Shopify tokens & channels: `SHOPIFY_SETUP.md`
- Session notes: `HANDOFF.md`
