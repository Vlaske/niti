import { promoConfig } from "@/config/promo";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function todayInBelgrade(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isPromoExpired(now = new Date()) {
  const end = promoConfig.endsOn;
  if (!end || !ISO_DATE.test(end)) return false;
  return todayInBelgrade(now) > end;
}

/**
 * Env wins over the file so hosting can kill the edit without a deploy.
 * A forced "on" also ignores the end date.
 */
export function isPromoActive(now = new Date()) {
  const env = process.env.NITI_PROMO_ENABLED?.trim().toLowerCase();
  if (env === "false" || env === "0" || env === "off") return false;
  if (env === "true" || env === "1" || env === "on") return true;
  if (!promoConfig.enabled) return false;
  return !isPromoExpired(now);
}

/** Date line for the homepage. Hidden once the day has passed. */
export function getPromoEndsOn(now = new Date()) {
  const end = promoConfig.endsOn;
  if (!end || !ISO_DATE.test(end) || isPromoExpired(now)) return null;
  return end;
}
