import type { Product } from "@/types";

/** Drop fields the grid never renders so the shop payload stays small. */
export function toListingProduct(product: Product): Product {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    brand: product.brand,
    description: "",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    categories: product.categories,
    collection: product.collection,
    image: product.image,
    colors: product.colors,
    options: product.options,
    variants: product.variants,
    variantId: product.variantId,
    availableForSale: product.availableForSale,
    isNew: product.isNew,
    isSale: product.isSale,
    tags: product.tags,
  };
}
