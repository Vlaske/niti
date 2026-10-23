"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { NewsletterImageProvider } from "@/context/SiteImagesContext";
import { CartToast } from "@/components/ui/CartToast";
import { RouteAnimationReset } from "@/components/providers/RouteAnimationReset";
import type { Category } from "@/types";

export function AppProviders({
  children,
  navCategories,
  newsletterImage,
}: {
  children: ReactNode;
  navCategories: Category[];
  newsletterImage: string;
}) {
  return (
    <LanguageProvider>
      <NewsletterImageProvider image={newsletterImage}>
        <CategoriesProvider categories={navCategories}>
          <CartProvider>
            <RecentlyViewedProvider>
              <RouteAnimationReset />
              {children}
              <CartToast />
            </RecentlyViewedProvider>
          </CartProvider>
        </CategoriesProvider>
      </NewsletterImageProvider>
    </LanguageProvider>
  );
}
