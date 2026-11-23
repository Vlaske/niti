import { Header } from "@/components/layout/Header";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function ProductLoading() {
  return (
    <>
      <Header />
      <main>
        <PageSkeleton variant="product" />
      </main>
    </>
  );
}
