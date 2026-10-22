"use client";

import { useLanguage } from "@/context/LanguageContext";

export function NewsletterForm() {
  const { t } = useLanguage();

  return (
    <form
      className="flex w-full max-w-lg flex-col overflow-hidden rounded-md bg-white sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email") || "").trim();
        if (!email) return;
        window.location.href = `mailto:info@nitihome.rs?subject=${encodeURIComponent("Newsletter")}&body=${encodeURIComponent(email)}`;
      }}
    >
      <input
        type="email"
        required
        name="email"
        placeholder={t("footer.email")}
        className="flex-1 px-4 py-3.5 text-sm text-niti-charcoal outline-none"
        aria-label={t("footer.email")}
      />
      <button
        type="submit"
        className="min-h-12 bg-niti-charcoal px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-niti-footer"
      >
        {t("footer.subscribe")}
      </button>
    </form>
  );
}
