"use client";

import { useLanguage } from "@/context/LanguageContext";

export function NewsletterForm() {
  const { t } = useLanguage();

  return (
    <form
      className="flex w-full max-w-lg overflow-hidden rounded-md bg-white"
      onSubmit={(e) => {
        e.preventDefault();
        // Wire to Klaviyo / Shopify / form endpoint before launch
      }}
    >
      <input
        type="email"
        required
        placeholder={t("footer.email")}
        className="flex-1 px-4 py-3.5 text-sm text-niti-charcoal outline-none"
        aria-label={t("footer.email")}
      />
      <button
        type="submit"
        className="bg-niti-charcoal px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-niti-footer"
      >
        {t("footer.subscribe")}
      </button>
    </form>
  );
}
