"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types";
import { getProductByHandle } from "@/lib/data/products";

const STORAGE_KEY = "niti-recently-viewed";
const MAX_ITEMS = 8;

type RecentlyViewedContextValue = {
  handles: string[];
  products: Product[];
  addViewed: (handle: string) => void;
};

const RecentlyViewedContext =
  createContext<RecentlyViewedContextValue | null>(null);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [handles, setHandles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHandles(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const addViewed = useCallback((handle: string) => {
    setHandles((prev) => {
      const next = [handle, ...prev.filter((h) => h !== handle)].slice(
        0,
        MAX_ITEMS
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const products = useMemo(
    () =>
      handles
        .map((h) => getProductByHandle(h))
        .filter((p): p is Product => Boolean(p)),
    [handles]
  );

  const value = useMemo(
    () => ({ handles, products, addViewed }),
    [handles, products, addViewed]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx)
    throw new Error(
      "useRecentlyViewed must be used within RecentlyViewedProvider"
    );
  return ctx;
}
