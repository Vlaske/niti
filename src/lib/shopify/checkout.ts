export type CheckoutLocale = "sr" | "en";

/**
 * Headless checkout URL:
 * - channel=headless-storefronts (obavezno kad je Online Store pod lozinkom)
 * - locale=sr (pokušaj srpskog checkout-a ako je podešen u Admin-u)
 */
export function normalizeCheckoutUrl(
  url: string,
  locale: CheckoutLocale = "sr"
): string {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("channel")) {
      parsed.searchParams.set("channel", "headless-storefronts");
    }
    if (locale === "sr" && !parsed.searchParams.has("locale")) {
      parsed.searchParams.set("locale", "sr");
    }
    return parsed.toString();
  } catch {
    const parts = [url];
    if (!url.includes("channel=")) {
      parts.push(`${url.includes("?") ? "&" : "?"}channel=headless-storefronts`);
    }
    if (locale === "sr" && !url.includes("locale=")) {
      const base = parts[parts.length - 1];
      parts[parts.length - 1] = `${base}${base.includes("?") ? "&" : "?"}locale=sr`;
    }
    return parts.length > 1 ? parts.join("") : url;
  }
}
