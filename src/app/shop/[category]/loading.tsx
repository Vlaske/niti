import { Header } from "@/components/layout/Header";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function CategoryLoading() {
  return (
    <>
      <Header />
      <main>
        <PageSkeleton variant="shop" />
      </main>
    </>
  );
}
