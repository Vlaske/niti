import { designShowcaseEntries } from "@/config/design-showcase";
import { getProductByHandle } from "@/lib/catalog";

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

export async function getDesignShowcaseItems(): Promise<DesignShowcaseItem[]> {
  const items: DesignShowcaseItem[] = [];
  const products = await Promise.all(
    designShowcaseEntries.map((entry) => getProductByHandle(entry.productHandle))
  );

  for (let i = 0; i < designShowcaseEntries.length; i++) {
    const entry = designShowcaseEntries[i]!;
    const product = products[i];
    if (!product) {
      console.warn(
        `[design-showcase] Handle "${entry.productHandle}" nije pronađen — stavka ${entry.id} je preskočena. Ažuriraj src/config/design-showcase.ts`
      );
      continue;
    }

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
