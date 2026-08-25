import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

type LegalPageProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <PageShell mainClassName="pt-[var(--header-offset)]">
      <article className="mx-auto max-w-2xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-niti-muted">
          NITI.
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium text-niti-charcoal md:text-4xl">
          {title}
        </h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-niti-muted md:text-base">
          {children}
        </div>
        <p className="mt-10 text-sm text-niti-muted">
          Pitanja?{" "}
          <a
            href="mailto:hello@niti.home"
            className="interactive text-niti-charcoal underline underline-offset-2"
          >
            hello@niti.home
          </a>
          {" · "}
          <Link href="/shop" className="interactive text-niti-charcoal underline underline-offset-2">
            Nazad u prodavnicu
          </Link>
        </p>
      </article>
    </PageShell>
  );
}
