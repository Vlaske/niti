import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ProductPageView } from "@/components/product/ProductPageView";
import { getProductByHandle, getProductHandles, getRelatedProducts } from "@/lib/catalog";
import { getPromoEdit } from "@/lib/promo";
import type { Product } from "@/types";

type Props = {
  params: Promise<{ handle: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  const handles = await getProductHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  return {
    title: product?.title ?? "Proizvod",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  const promo = await getPromoEdit();
  const sample = promo.preview
    ? promo.products.find((item) => item.handle === product.handle)
    : undefined;
  const view = sample ? withPreviewPrices(product, sample) : product;
  const related = await getRelatedProducts(product);

  return (
    <PageShell mainClassName="pt-[var(--header-offset)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 md:px-8 lg:px-12">
        <ProductPageView product={view} related={related} />
      </div>
    </PageShell>
  );
}

function withPreviewPrices(product: Product, sample: Product): Product {
  const byId = new Map(
    sample.variants?.map((variant) => [variant.id, variant.compareAtPrice])
  );
  return {
    ...product,
    compareAtPrice: sample.compareAtPrice,
    isSale: true,
    variants: product.variants?.map((variant) => ({
      ...variant,
      compareAtPrice: byId.get(variant.id) ?? variant.compareAtPrice,
    })),
  };
}
