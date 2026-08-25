import { clsx, type ClassValue } from "clsx";
import type { Locale } from "@/lib/i18n/translations";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const priceFormatter = (locale: Locale) =>
  new Intl.NumberFormat(locale === "sr" ? "sr-RS" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

/** Prices in data are stored as integer RSD amounts */
export function formatPrice(amount: number, locale: Locale = "sr") {
  return `${priceFormatter(locale).format(amount)} RSD`;
}

/** Split amount + currency for styled price components */
export function formatPriceParts(amount: number, locale: Locale = "sr") {
  return {
    amount: priceFormatter(locale).format(amount),
    currency: "RSD",
  };
}
