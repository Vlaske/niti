"use client";

import { createContext, useContext, type ReactNode } from "react";

type PromoContextValue = {
  /** Master switch: homepage band + percent badges. */
  active: boolean;
  /** Discounted products exist — show Sniženo in menu / footer. */
  hasSale: boolean;
};

const PromoContext = createContext<PromoContextValue>({
  active: false,
  hasSale: false,
});

export function PromoProvider({
  active,
  hasSale,
  children,
}: {
  active: boolean;
  hasSale: boolean;
  children: ReactNode;
}) {
  return (
    <PromoContext.Provider value={{ active, hasSale }}>
      {children}
    </PromoContext.Provider>
  );
}

/** True while the sale edit is on. False restores the previous price treatment. */
export function usePromo() {
  return useContext(PromoContext).active;
}

/** True when the Sniženo menu / footer link should appear. */
export function usePromoNav() {
  return useContext(PromoContext).hasSale;
}
