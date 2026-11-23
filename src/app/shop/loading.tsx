import { Header } from "@/components/layout/Header";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function ShopLoading() {
  return (
    <>
      <Header />
      <main>
        <PageSkeleton variant="shop" />
      </main>
    </>
  );
}
