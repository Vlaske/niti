import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ProductPageView } from "@/components/product/ProductPageView";
import { getAllProducts, getProductByHandle, getProductHandles } from "@/lib/catalog";

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

  const all = await getAllProducts();
  const related = all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <PageShell mainClassName="pt-24 md:pt-28">
      <div className="mx-auto max-w-[1440px] px-4 pb-20 md:px-8 lg:px-12">
        <ProductPageView product={product} related={related} />
      </div>
    </PageShell>
  );
}
