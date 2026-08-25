"use client";

import Link from "next/link";
import {
  CreditCard,
  Headphones,
  Home,
  Mail,
  Phone,
  Share2,
  ShoppingBag,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { CATEGORY_GROUPS, getGroupHref } from "@/config/store-categories";
import { useLanguage } from "@/context/LanguageContext";
import { valueProps } from "@/lib/data/collections";

const companyLinks = [
  { label: "Naša priča", href: "/#faq" },
  { label: "Kontakt", href: "mailto:hello@niti.home" },
];

const careLinks = [
  { label: "Politika dostave", href: "/dostava" },
  { label: "Povrati", href: "/povrati" },
  { label: "Vodič za negu", href: "/nega" },
  { label: "FAQ", href: "/#faq" },
];

const legalLinks = [
  { label: "Privatnost", href: "/privatnost" },
  { label: "Uslovi korišćenja", href: "/uslovi" },
  { label: "Dostava", href: "/dostava" },
  { label: "Povrati", href: "/povrati" },
];

const icons: Record<string, React.ReactNode> = {
  shipping: <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />,
  service: <Headphones className="h-5 w-5" strokeWidth={1.25} />,
  payment: <CreditCard className="h-5 w-5" strokeWidth={1.25} />,
  contact: <Mail className="h-5 w-5" strokeWidth={1.25} />,
};

/** Shared horizontal inset — same as shop / homepage content */
const FOOTER_INSET = "mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
        {title}
      </h4>
      {children}
    </div>
  );
}

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto">
      <section className="border-t border-niti-line bg-niti-cream py-10 md:py-14">
        <div className={`${FOOTER_INSET} grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-8`}>
          {valueProps.map((item) => (
            <div key={item.title} className="flex min-w-0 flex-col">
              <div className="mb-3 text-niti-charcoal">{icons[item.icon]}</div>
              <h3 className="text-xs font-semibold uppercase tracking-wide md:text-sm">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-niti-muted md:text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-niti-charcoal/55" />
        <div className={`${FOOTER_INSET} relative flex justify-center py-14 md:py-20`}>
          <div className="flex w-full max-w-xl flex-col items-center text-center text-white">
            <h2 className="mb-2 font-serif text-xl font-medium md:mb-3 md:text-3xl">
              {t("footer.newsletter")}
            </h2>
            <p className="mb-6 text-xs text-white/85 md:mb-8 md:text-base">
              {t("footer.newsletterSub")}
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      <div className="bg-niti-footer text-white">
        <div
          className={`${FOOTER_INSET} grid grid-cols-2 gap-x-8 gap-y-10 py-12 md:grid-cols-4 md:gap-x-10 md:py-14 lg:gap-x-12 lg:py-16`}
        >
          <div className="col-span-2 md:col-span-1">
            <p className="font-serif text-2xl font-semibold tracking-[0.12em] md:text-3xl">
              NITI.
            </p>
            <div className="mt-5 space-y-2.5 text-sm text-white/70">
              <p className="flex items-start gap-2.5">
                <Home className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                Beograd, Srbija
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                +381 11 123 4567
              </p>
            </div>
          </div>

          <FooterColumn title={t("footer.company")}>
            <ul className="space-y-2.5 text-sm leading-snug text-white/70">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="interactive hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title={t("footer.shop")}>
            <ul className="space-y-2.5 text-sm leading-snug text-white/70">
              {CATEGORY_GROUPS.map((g) => (
                <li key={g.id}>
                  <Link
                    href={getGroupHref(g.id)}
                    className="interactive hover:text-white"
                  >
                    {g.title}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/shop"
                  className="interactive text-white/90 hover:text-white"
                >
                  {t("nav.allProducts")}
                </Link>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn title={t("footer.care")}>
            <ul className="space-y-2.5 text-sm leading-snug text-white/70">
              {careLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="interactive hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <div className="border-t border-white/10 bg-niti-footer-dark">
          <div
            className={`${FOOTER_INSET} flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:py-6`}
          >
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/55 md:text-xs">
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="interactive hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <select
                className="interactive rounded border border-white/20 bg-transparent px-2 py-1.5 text-xs text-white/80"
                defaultValue="rs"
                aria-label="Region"
              >
                <option value="rs">Srbija (RSD)</option>
              </select>
              <Link
                href="#"
                aria-label="Društvene mreže"
                className="interactive text-white/70 hover:text-white"
              >
                <Share2 className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
