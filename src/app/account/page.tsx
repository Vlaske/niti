import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <PageShell mainClassName="pt-24 md:pt-28">
      <div className="mx-auto max-w-xl px-4 pb-20 text-center md:px-8">
        <h1 className="text-3xl font-semibold">Account</h1>
        <p className="mt-4 text-niti-muted">
          Customer accounts will be powered by Shopify Customer Account API.
        </p>
      </div>
    </PageShell>
  );
}
