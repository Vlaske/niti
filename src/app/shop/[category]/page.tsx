import { notFound } from "next/navigation";
import { CategoryPageLayout } from "@/components/shop/CategoryPageLayout";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/catalog";
import { products as mockProducts } from "@/lib/data/products";
import type { Category } from "@/types";

type Props = {
  params: Promise<{ category: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  return [
    { category: "bedsheets" },
    { category: "towels" },
    { category: "throws" },
    { category: "accessories" },
    { category: "linen" },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  if (category === "linen") return { title: "Lan" };
  const cat = getCategoryBySlug(category);
  return { title: cat?.title ?? "Kategorija" };
}

const linenCategory: Category = {
  slug: "linen",
  title: "Lan",
  description:
    "Evropski lan i meko oprani kompleti — prirodan komfor za svaku sezonu.",
  image:
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&q=85",
  productCount: 2,
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (category === "linen") {
    const fromShopify = await getProductsByCategory("linen");
    const linenProducts =
      fromShopify.length > 0
        ? fromShopify
        : mockProducts.filter((p) => p.collection === "linen");
    return (
      <CategoryPageLayout
        category={linenCategory}
        activeSlug="linen"
        productList={linenProducts}
        initialFilter="all"
      />
    );
  }

  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const productList = await getProductsByCategory(category);

  return (
    <CategoryPageLayout
      category={cat}
      activeSlug={category}
      productList={productList}
      initialFilter={category}
    />
  );
}
