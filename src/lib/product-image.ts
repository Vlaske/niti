import { CATEGORY_IMAGE_FALLBACK } from "@/lib/catalog/categories";

export function isUsableImageSrc(src?: string | null): src is string {
  return typeof src === "string" && src.trim().length > 0;
}

export function productImageSrc(src?: string | null): string {
  return isUsableImageSrc(src) ? src.trim() : CATEGORY_IMAGE_FALLBACK;
}
