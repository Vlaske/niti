"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { CartToast } from "@/components/ui/CartToast";
import { RouteAnimationReset } from "@/components/providers/RouteAnimationReset";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <RecentlyViewedProvider>
          <RouteAnimationReset />
          {children}
          <CartToast />
        </RecentlyViewedProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
