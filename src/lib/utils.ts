import { clsx, type ClassValue } from "clsx";
import type { Locale } from "@/lib/i18n/translations";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Prices in data are stored as integer RSD amounts */
export function formatPrice(amount: number, locale: Locale = "sr") {
  const tag = locale === "sr" ? "sr-RS" : "en-RS";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
