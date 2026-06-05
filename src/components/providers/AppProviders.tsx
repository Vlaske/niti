"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { CartToast } from "@/components/ui/CartToast";
import { RouteAnimationReset } from "@/components/providers/RouteAnimationReset";
import type { Category } from "@/types";

export function AppProviders({
  children,
  navCategories,
}: {
  children: ReactNode;
  navCategories: Category[];
}) {
  return (
    <LanguageProvider>
      <CategoriesProvider categories={navCategories}>
        <CartProvider>
          <RecentlyViewedProvider>
            <RouteAnimationReset />
            {children}
            <CartToast />
          </RecentlyViewedProvider>
        </CartProvider>
      </CategoriesProvider>
    </LanguageProvider>
  );
}
