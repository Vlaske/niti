"use client";

import { useLanguage } from "@/context/LanguageContext";

export function CartPageTitle() {
  const { t } = useLanguage();
  return (
    <h1 className="mb-10 text-3xl font-semibold md:text-4xl">{t("cart.title")}</h1>
  );
}
