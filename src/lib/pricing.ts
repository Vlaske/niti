export type Discount = {
  price: number;
  compareAt: number;
  savings: number;
  /**
   * Whole percent, rounded down.
   * Rounding a discount up (7.7% shown as 8%) lowers purchase intent:
   * the precise, smaller figure reads as a shorter offer.
   * Flooring also keeps the badge from claiming more than the math.
   */
  percent: number;
};

/** Real cut only: compare-at must be a higher price we were actually asking. */
export function getDiscount(
  price: number,
  compareAt?: number | null
): Discount | null {
  if (compareAt == null || !Number.isFinite(compareAt) || !Number.isFinite(price)) {
    return null;
  }
  if (compareAt <= price || price < 0) return null;
  const savings = compareAt - price;
  const percent = Math.floor((savings / compareAt) * 100);
  return { price, compareAt, savings, percent };
}

/** Compare-at that floors to exactly `percent` (never a bigger claim). */
export function compareAtForPercent(price: number, percent: number) {
  if (percent <= 0 || percent >= 100 || price <= 0) return price;
  const floorPercent = (compareAt: number) =>
    Math.floor(((compareAt - price) / compareAt) * 100);
  let compareAt = Math.ceil(price / (1 - percent / 100));
  while (floorPercent(compareAt) < percent) compareAt += 1;
  while (compareAt > price + 1 && floorPercent(compareAt) > percent) {
    compareAt -= 1;
  }
  return compareAt;
}

export function compareDiscounts(a: Discount, b: Discount) {
  if (b.percent !== a.percent) return b.percent - a.percent;
  return b.savings - a.savings;
}
