"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { getNavCategories } from "@/config/store-categories";
import type { Category } from "@/types";

const CategoriesContext = createContext<Category[]>(getNavCategories());

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: ReactNode;
}) {
  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useNavCategories() {
  return useContext(CategoriesContext);
}
