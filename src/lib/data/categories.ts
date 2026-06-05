export {
  CATEGORY_COLLECTION_HANDLES,
  getCategorySlugs,
  getNavCategories,
  getStoreCategoryBySlug,
  isNavCategorySlug,
  STORE_CATEGORIES,
} from "@/config/store-categories";

import { getNavCategories, getStoreCategoryBySlug } from "@/config/store-categories";

/** @deprecated Koristi getNavCategories() */
export const categories = getNavCategories();

export function getCategoryBySlug(slug: string) {
  return getStoreCategoryBySlug(slug);
}
