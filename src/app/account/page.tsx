import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "Nalog",
};

export default function AccountPage() {
  return (
    <PageShell mainClassName="pt-[var(--header-offset)]">
      <div className="mx-auto max-w-lg px-4 pb-24 pt-10 text-center md:px-8 md:pt-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-niti-muted">
          NITI.
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium text-niti-charcoal md:text-4xl">
          Nalog kupca
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-niti-muted md:text-base">
          Lični nalozi stižu uz Shopify Customer Accounts — praćenje porudžbina,
          adrese i brži checkout. Do tada porudžbine završavate bez naloga, a
          pitanja šaljite na{" "}
          <a
            href="mailto:hello@niti.home"
            className="interactive text-niti-charcoal underline underline-offset-2"
          >
            hello@niti.home
          </a>
          .
        </p>
        <Link
          href="/shop"
          className="interactive mt-8 inline-flex border border-niti-charcoal/20 px-6 py-3 text-sm font-medium text-niti-charcoal transition-colors hover:border-niti-charcoal/40 hover:bg-niti-sand/40"
        >
          Nastavi kupovinu
        </Link>
      </div>
    </PageShell>
  );
}
