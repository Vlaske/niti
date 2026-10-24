"use client";

import Link from "next/link";
import {
  CreditCard,
  Headphones,
  Home,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { CATEGORY_GROUPS, getGroupHref } from "@/config/store-categories";
import { useLanguage } from "@/context/LanguageContext";
import { useNewsletterImage } from "@/context/SiteImagesContext";
import { valueProps } from "@/lib/data/collections";

const LEGAL_NAME =
  "Ljubiša Todorović PR, ostala trgovina na malo izvan prodavnica, tezgi i pijaca, Viktorija-KV Kraljevo";

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
      <h4 className="mb-3 text-[11px] font-semibold uppercase leading-snug tracking-[0.14em] text-white sm:mb-4 sm:tracking-[0.18em]">
        {title}
      </h4>
      {children}
    </div>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const newsletterImage = useNewsletterImage();

  return (
    <footer className="mt-auto">
      <section className="border-t border-niti-line bg-niti-cream py-10 md:py-14">
        <div className={`${FOOTER_INSET} grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4 lg:gap-8`}>
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
            backgroundImage: `url(${newsletterImage})`,
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
        <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[minmax(16rem,1.35fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-x-14 lg:px-12 lg:py-16">
          <div className="min-w-0 px-4 py-8 lg:px-0 lg:py-0">
            <p className="font-serif text-2xl font-semibold tracking-[0.12em] md:text-3xl">
              NITI.
            </p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 lg:mt-5">
              Podaci o privredniku
            </p>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-white/70">
              {LEGAL_NAME}
            </p>
            <div className="mt-4 text-sm text-white/70">
              <p className="flex items-start gap-2.5">
                <Home className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>
                  Milorada Karapandžića Rakice br. 4
                  <span className="mt-0.5 block">Kraljevo</span>
                  <span className="mt-1.5 block text-xs tracking-wide text-white/55">
                    MB 66008657
                    <span className="mx-2 text-white/30">·</span>
                    PIB 112297829
                  </span>
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                <a
                  href="mailto:info@nitihome.rs"
                  className="interactive flex items-center gap-2.5 hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  info@nitihome.rs
                </a>
                <a
                  href="https://www.instagram.com/nitihome.rs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactive flex items-center gap-2.5 hover:text-white"
                >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
                  @nitihome.rs
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/15 px-4 py-8 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-x-14 lg:border-0 lg:p-0">
          <div className="grid grid-cols-2 gap-x-8 lg:contents">
          <FooterColumn title={t("footer.shop")}>
            <ul className="space-y-2 text-sm leading-snug text-white/70 sm:space-y-2.5">
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
            <ul className="space-y-2 text-sm leading-snug text-white/70 sm:space-y-2.5">
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
          </div>
        </div>

        <div className="border-t border-white/10 bg-niti-footer-dark">
          <div
            className={`${FOOTER_INSET} flex flex-col gap-4 pt-5 pb-16 md:flex-row md:items-center md:justify-between md:py-6`}
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
            <select
              className="interactive w-fit rounded border border-white/20 bg-transparent px-2 py-1.5 text-xs text-white/80"
              defaultValue="rs"
              aria-label="Region"
            >
              <option value="rs">Srbija (RSD)</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
