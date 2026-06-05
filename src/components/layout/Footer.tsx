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
import { useNavCategories } from "@/context/CategoriesContext";
import { useLanguage } from "@/context/LanguageContext";
import { valueProps } from "@/lib/data/collections";

const companyLinks = [
  { label: "Održivost", href: "/#faq" },
  { label: "Karijere", href: "#" },
  { label: "Press", href: "#" },
];

const careLinks = [
  { label: "Politika dostave", href: "#" },
  { label: "Povrati", href: "#" },
  { label: "Vodič za negu", href: "#" },
  { label: "FAQ", href: "/#faq" },
];

const legalLinks = [
  "Pravno",
  "Prodaja i povrati",
  "Privatnost",
  "Uslovi korišćenja",
];

const icons: Record<string, React.ReactNode> = {
  shipping: <ShoppingBag className="h-6 w-6" strokeWidth={1.25} />,
  service: <Headphones className="h-6 w-6" strokeWidth={1.25} />,
  payment: <CreditCard className="h-6 w-6" strokeWidth={1.25} />,
  contact: <Mail className="h-6 w-6" strokeWidth={1.25} />,
};

export function Footer() {
  const { t } = useLanguage();
  const navCategories = useNavCategories();
  const shopLinks = [
    ...navCategories.map((c) => ({
      label: c.title,
      href: `/shop/${c.slug}`,
    })),
    { label: t("nav.allProducts"), href: "/shop" },
  ];

  return (
    <footer className="mt-auto">
      <section className="border-t border-niti-line bg-niti-cream py-14 md:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-8 lg:px-12">
          {valueProps.map((item) => (
            <div key={item.title} className="flex flex-col gap-3">
              <div className="text-niti-charcoal">{icons[item.icon]}</div>
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-niti-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative min-h-[320px] overflow-hidden md:min-h-[380px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-niti-charcoal/55" />
        <div className="relative mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-20 text-center text-white md:py-28">
          <h2 className="mb-3 text-2xl font-semibold md:text-4xl">
            {t("footer.newsletter")}
          </h2>
          <p className="mb-8 text-sm text-white/85 md:text-base">
            {t("footer.newsletterSub")}
          </p>
          <NewsletterForm />
        </div>
      </section>

      <div className="bg-niti-footer text-white">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 md:px-8 lg:px-12 lg:py-16">
          <div>
            <p className="font-serif text-3xl font-bold tracking-[0.15em] md:text-4xl">
              NITI.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/75">
              <p className="flex items-start gap-2">
                <Home className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                Beograd, Srbija
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                +381 11 123 4567
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("footer.company")}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/#faq" className="interactive hover:text-white">
                  Naša priča
                </Link>
              </li>
              {companyLinks.slice(1).map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="interactive hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("footer.shop")}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="interactive hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t("footer.care")}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              {careLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="interactive hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 bg-niti-footer-dark">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-12">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
              {legalLinks.map((label) => (
                <Link
                  key={label}
                  href="#"
                  className="interactive hover:text-white"
                >
                  {label}
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
