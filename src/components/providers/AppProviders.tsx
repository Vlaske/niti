"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { PromoProvider } from "@/context/PromoContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { NewsletterImageProvider } from "@/context/SiteImagesContext";
import { CartToast } from "@/components/ui/CartToast";
import { RouteAnimationReset } from "@/components/providers/RouteAnimationReset";
import type { Category } from "@/types";

export function AppProviders({
  children,
  navCategories,
  newsletterImage,
  promoActive,
  promoHasSale,
}: {
  children: ReactNode;
  navCategories: Category[];
  newsletterImage: string;
  promoActive: boolean;
  promoHasSale: boolean;
}) {
  return (
    <LanguageProvider>
      <PromoProvider active={promoActive} hasSale={promoHasSale}>
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
      </PromoProvider>
    </LanguageProvider>
  );
}
