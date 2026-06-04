import { PageShell } from "@/components/layout/PageShell";
import { CartContent } from "@/components/cart/CartContent";
import { CartPageTitle } from "@/components/cart/CartPageTitle";

export const metadata = {
  title: "Korpa",
};

export default function CartPage() {
  return (
    <PageShell mainClassName="pt-24 md:pt-28">
      <div className="mx-auto max-w-[1440px] px-4 pb-20 md:px-8 lg:px-12">
        <CartPageTitle />
        <CartContent />
      </div>
    </PageShell>
  );
}
