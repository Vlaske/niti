import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "bedsheets",
    title: "Posteljina",
    description:
      "Perkal, lan i saten u nežnim pastelnim tonovima — za miran i profinjen san.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85",
    productCount: 4,
  },
  {
    slug: "towels",
    title: "Peškiri",
    description:
      "Spa frotir i brzosušeći setovi — kupatilski tekstil premium kvaliteta.",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&q=85",
    productCount: 3,
  },
  {
    slug: "throws",
    title: "Ćebad",
    description:
      "Slojevi teksture za krevet, sofa i kutak za čitanje.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=85",
    productCount: 1,
  },
  {
    slug: "accessories",
    title: "Dodaci",
    description:
      "Završni detalji koji upotpunjuju vaš tekstilni identitet doma.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=85",
    productCount: 1,
  },
];

export const shopFilters = [
  { id: "all", label: "All" },
  { id: "bedsheets", label: "Bedsheets" },
  { id: "towels", label: "Towels" },
  { id: "throws", label: "Throws" },
  { id: "accessories", label: "Accessories" },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
