import { designShowcaseEntries } from "@/config/design-showcase";
import { getAllProducts, getProductByHandle } from "@/lib/catalog";
import type { Product } from "@/types";

export type DesignShowcaseItem = {
  id: string;
  href: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  thumb: string;
  description: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  poster: string;
};

function resolveProduct(
  entryHandle: string,
  entryId: string,
  allProducts: Product[]
): Product | null {
  const direct = allProducts.find((p) => p.handle === entryHandle);
  if (direct) return direct;

  return new Promise<Product | null>((resolve) => {
    getProductByHandle(entryHandle).then((fetched) => {
      if (fetched) {
        resolve(fetched);
        return;
      }
      const idx = parseInt(entryId, 10) - 1;
      const fallback = allProducts[idx] ?? null;
      if (fallback) {
        console.warn(
          `[design-showcase] Handle "${entryHandle}" nije pronađen — koristim "${fallback.handle}" za stavku ${entryId}. Ažuriraj src/config/design-showcase.ts`
        );
      }
      resolve(fallback);
    });
  }) as unknown as Product | null;
}

export async function getDesignShowcaseItems(): Promise<DesignShowcaseItem[]> {
  const items: DesignShowcaseItem[] = [];
  const allProducts = await getAllProducts();

  for (const entry of designShowcaseEntries) {
    let product = allProducts.find((p) => p.handle === entry.productHandle);
    if (!product) {
      product = (await getProductByHandle(entry.productHandle)) ?? undefined;
    }
    if (!product) {
      const idx = parseInt(entry.id, 10) - 1;
      product = allProducts[idx];
      if (product) {
        console.warn(
          `[design-showcase] Handle "${entry.productHandle}" nije pronađen — koristim "${product.handle}" za stavku ${entry.id}. Ažuriraj src/config/design-showcase.ts`
        );
      }
    }
    if (!product) continue;

    const mediaType = entry.mediaType ?? "image";
    const poster = entry.poster ?? product.image;
    const mediaSrc =
      entry.mediaSrc ?? (mediaType === "video" ? poster : product.image);

    items.push({
      id: entry.id,
      href: `/product/${product.handle}`,
      title: product.title,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      thumb: product.image,
      description: entry.description,
      mediaType,
      mediaSrc,
      poster,
    });
  }

  return items;
}
