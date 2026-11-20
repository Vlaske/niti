/**
 * Sale edit — master switch and Shopify wiring.
 *
 * Full guide: SALE_EDIT.md
 *
 * Quick off (homepage band + percent badges go away; old site look):
 *   1. `enabled: false` here, or
 *   2. `NITI_PROMO_ENABLED=false` in `.env.local` / hosting, then restart.
 *
 * Quick on:
 *   `enabled: true`, or `NITI_PROMO_ENABLED=true` (forces on, ignores endsOn).
 *
 * Products come from Shopify Compare-at price (never invented).
 * Optional curated list: collection handle `akcija`.
 * No real discounts in production → nothing sale-related is shown.
 */
export const promoConfig = {
  /**
   * Homepage charcoal band + percent-off badges across the shop.
   * Menu “Sniženo” can still appear when discounted products exist
   * even if this is false — buyers can open /shop?snizeno=1.
   */
  enabled: true,
  /** Inclusive last day, YYYY-MM-DD, Europe/Belgrade. null = until you turn it off. */
  endsOn: null as string | null,
  /** Shopify collection handle for a curated edit. Create it in Admin when you want one. */
  collectionHandle: "akcija",
  /**
   * When true, only the `akcija` collection is used. Empty collection =
   * no homepage band and no sale listing (until you add discounted products).
   */
  collectionOnly: false,
  /** Pin handles when you are not using the collection. Ignored when the collection has discounts. */
  handles: [] as string[],
  /** How many sale pieces to show in the homepage carousel (swipe for more). */
  maxProducts: 12,
  /**
   * Development only. When the catalog has no compare-at prices, localhost
   * shows a sample edit so the layout can be reviewed. Ignored in production,
   * and ignored as soon as any real discount exists.
   */
  previewWhenEmpty: true,
};
