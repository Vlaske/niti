import type { Product } from "@/types";

/** All prices in Serbian dinar (RSD), whole numbers */
export const products: Product[] = [
  {
    id: "1",
    handle: "cloud-linen-sheet-set",
    title: "Cloud Linen Sheet Set",
    brand: "NITI.",
    description:
      "Woven from long-staple European flax with a soft-washed finish. Breathable, durable, and designed for year-round comfort.",
    price: 20900,
    compareAtPrice: 25900,
    category: "bedsheets",
    collection: "linen",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
    ],
    colors: [
      { name: "Blush", hex: "#f4e4e0" },
      { name: "Sage", hex: "#d4e4dc" },
      { name: "Mist", hex: "#e8e4f0" },
    ],
    tagline:
      "Every thread is chosen for softness and longevity — a calm foundation for restful nights.",
    isSale: true,
    isNew: true,
  },
  {
    id: "2",
    handle: "sage-terry-towel-bundle",
    title: "Sage Terry Towel Bundle",
    brand: "NITI.",
    description:
      "Plush 600 GSM cotton towels with a looped terry interior and quick-dry weave. Set includes bath, hand, and washcloth.",
    price: 10900,
    category: "towels",
    collection: "bath",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    colors: [
      { name: "Sage", hex: "#b8cfc0" },
      { name: "Sand", hex: "#e8dfd4" },
    ],
    isNew: true,
  },
  {
    id: "3",
    handle: "pastel-duvet-cover",
    title: "Pastel Duvet Cover",
    brand: "NITI.",
    description:
      "Silky percale cotton with a subtle matte finish. Hidden button closure and interior corner ties keep your duvet in place.",
    price: 17900,
    category: "bedsheets",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    colors: [
      { name: "Lavender", hex: "#e8e4f0" },
      { name: "Peach", hex: "#f8e8dc" },
    ],
    tagline:
      "Soft color, softer touch — designed to elevate everyday bedding into something serene.",
  },
  {
    id: "4",
    handle: "woven-throw-blanket",
    title: "Woven Throw Blanket",
    brand: "NITI.",
    description:
      "Lightweight cotton-blend throw with a textured basket weave. Perfect layered on a sofa or at the foot of the bed.",
    price: 8900,
    category: "accessories",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    colors: [{ name: "Cream", hex: "#faf7f2" }],
  },
  {
    id: "5",
    handle: "spa-bath-mat-set",
    title: "Spa Bath Mat Set",
    brand: "NITI.",
    description:
      "Absorbent low-pile mats with a non-slip backing. Machine washable and fade-resistant.",
    price: 7200,
    category: "towels",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    colors: [
      { name: "Stone", hex: "#d9d4cc" },
      { name: "Blush", hex: "#f4e4e0" },
    ],
  },
  {
    id: "6",
    handle: "organic-cotton-pillowcases",
    title: "Organic Cotton Pillowcases",
    brand: "NITI.",
    description:
      "GOTS-certified organic cotton in a 400 thread count sateen weave. Envelope closure for a clean finish.",
    price: 5400,
    category: "bedsheets",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Sage", hex: "#d4e4dc" },
    ],
    isNew: true,
  },
  {
    id: "7",
    handle: "luxe-guest-towel-set",
    title: "Luxe Guest Towel Set",
    brand: "NITI.",
    description:
      "Compact guest towels with a refined border detail. Ideal for powder rooms and guest suites.",
    price: 4900,
    category: "towels",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
  },
  {
    id: "8",
    handle: "quilted-bedspread",
    title: "Quilted Bedspread",
    brand: "NITI.",
    description:
      "Lightweight quilted coverlet with a channel-stitched pattern. Adds texture without extra warmth.",
    price: 21900,
    compareAtPrice: 27900,
    category: "bedsheets",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    isSale: true,
    tagline:
      "Layered comfort with a sculptural quilt pattern — made for beds that feel intentionally styled.",
  },
];

export function getProductByHandle(handle: string) {
  return products.find((p) => p.handle === handle);
}

export function getProductsByCategory(category: string) {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}
