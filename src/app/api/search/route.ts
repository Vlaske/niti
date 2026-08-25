import { NextRequest, NextResponse } from "next/server";
import {
  CATEGORY_GROUPS,
  STORE_CATEGORIES,
  getGroupForCategorySlug,
  getStoreCategoryBySlug,
} from "@/config/store-categories";
import { getAllProducts } from "@/lib/catalog";

export const revalidate = 60;

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 1) {
    return NextResponse.json({ products: [], categories: [], rooms: [] });
  }

  const needle = normalize(q);
  const products = await getAllProducts();

  const matchedProducts = products
    .filter((p) => {
      const hay = normalize(
        [p.title, p.brand, p.category, p.description, p.handle].join(" ")
      );
      return hay.includes(needle);
    })
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      price: p.price,
      image: p.image,
      category: p.category,
      categoryTitle: getStoreCategoryBySlug(p.category)?.title ?? p.category,
      roomId: getGroupForCategorySlug(p.category) ?? null,
    }));

  const matchedCategories = STORE_CATEGORIES.filter((c) =>
    normalize(`${c.title} ${c.description} ${c.slug}`).includes(needle)
  )
    .slice(0, 6)
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      href: `/shop/${c.slug}`,
      group: c.group,
    }));

  const matchedRooms = CATEGORY_GROUPS.filter((g) =>
    normalize(`${g.title} ${g.description} ${g.id}`).includes(needle)
  )
    .slice(0, 4)
    .map((g) => ({
      id: g.id,
      title: g.title,
      href: `/shop/${g.id}`,
    }));

  return NextResponse.json({
    products: matchedProducts,
    categories: matchedCategories,
    rooms: matchedRooms,
  });
}
