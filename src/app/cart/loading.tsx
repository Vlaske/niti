import { Header } from "@/components/layout/Header";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function CartLoading() {
  return (
    <>
      <Header />
      <main>
        <PageSkeleton variant="simple" />
      </main>
    </>
  );
}
