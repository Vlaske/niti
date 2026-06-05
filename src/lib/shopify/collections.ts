import { shopifyFetch } from "@/lib/shopify/client";
import { STORE_CATEGORIES } from "@/config/store-categories";

export type ShopifyCollectionMeta = {
  handle: string;
  title: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
};

const COLLECTION_META_QUERY = `
  query CollectionMeta($handle: String!) {
    collection(handle: $handle) {
      handle
      title
      description
      image {
        url
        altText
      }
      products(first: 250) {
        nodes {
          id
        }
      }
    }
  }
`;

export async function fetchCollectionMeta(
  handle: string
): Promise<ShopifyCollectionMeta | null> {
  const data = await shopifyFetch<{
    collection: {
      handle: string;
      title: string;
      description: string;
      image?: { url: string; altText?: string | null } | null;
      products: { nodes: { id: string }[] };
    } | null;
  }>(COLLECTION_META_QUERY, { handle }, { revalidate: 120 });

  if (!data.collection) return null;

  return {
    handle: data.collection.handle,
    title: data.collection.title,
    description: data.collection.description,
    imageUrl: data.collection.image?.url ?? null,
    productCount: data.collection.products.nodes.length,
  };
}

export async function fetchAllNavCollectionMeta(): Promise<
  Map<string, ShopifyCollectionMeta>
> {
  const map = new Map<string, ShopifyCollectionMeta>();

  await Promise.all(
    STORE_CATEGORIES.map(async (cat) => {
      try {
        const meta = await fetchCollectionMeta(cat.collectionHandle);
        if (meta) map.set(cat.slug, meta);
      } catch (e) {
        console.error(`[collections] ${cat.collectionHandle}:`, e);
      }
    })
  );

  return map;
}
