import type { Collection, FaqItem } from "@/types";

export const collections: Collection[] = [
  {
    slug: "bedsheets",
    title: "Posteljina",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=900&q=80",
    productCount: 4,
  },
  {
    slug: "towels",
    title: "Peškiri",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=900&q=80",
    productCount: 3,
  },
  {
    slug: "linen",
    title: "Lan",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&q=80",
    productCount: 2,
  },
  {
    slug: "accessories",
    title: "Dodaci",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=80",
    productCount: 2,
  },
];

export { heroSlides } from "@/config/hero-slides";

export const designCarouselItems = [
  {
    id: "1",
    title: "Cloud Linen Sheet Set",
    description:
      "Crafted with soft curves and natural materials — a calm layer for bedrooms that breathe.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=80",
    price: 20900,
    compareAtPrice: 25900,
    href: "/product/cloud-linen-sheet-set",
  },
  {
    id: "2",
    title: "Pastel Duvet Cover",
    description:
      "Silky percale in muted pastels — designed to slow down your evening routine.",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=200&q=80",
    price: 17900,
    href: "/product/pastel-duvet-cover",
  },
  {
    id: "3",
    title: "Quilted Bedspread",
    description:
      "Channel-stitched texture adds depth without weight — perfect for layered beds.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
    price: 21900,
    compareAtPrice: 27900,
    href: "/product/quilted-bedspread",
  },
  {
    id: "4",
    title: "Woven Throw Blanket",
    description:
      "Textured weave for sofas and reading corners — a finishing touch in cream and sand.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
    price: 8900,
    href: "/product/woven-throw-blanket",
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "Koje materijale koristite?",
    answer:
      "Koristimo dugog vlakna pamuk, evropski lan i GOTS sertifikovani organski pamuk. Na svakoj stranici proizvoda nalaze se sastav i uputstva za održavanje.",
  },
  {
    id: "2",
    question: "Gde se proizvodi NITI. tekstila?",
    answer:
      "Naši partnerski tekstilni pogoni su u Portugalu i Turskoj, birani zbog zanatstva, etičkih standarda i konzistentnog kvaliteta.",
  },
  {
    id: "3",
    question: "Kako da negujem lan i perkal?",
    answer:
      "Perite na hladno sa blagim deterdžentom, sušite na niskoj temperaturi ili na vazduhu. Lan postaje mekši sa svakim pranjem; izbegavajte izbeljivač.",
  },
  {
    id: "4",
    question: "Da li nudite besplatnu dostavu?",
    answer:
      "Da — besplatna standardna dostava za porudžbine preko 13.000 RSD (podešava se u Shopify-u prema tržištu).",
  },
  {
    id: "5",
    question: "Koja je politika povrata?",
    answer:
      "Neiskorišćeni proizvodi u originalnom pakovanju mogu se vratiti u roku od 30 dana. Posteljina otvorena radi provere veličine — kredit u prodavnici.",
  },
];

export const valueProps = [
  {
    icon: "shipping",
    title: "Besplatna dostava",
    description: "Besplatna dostava za porudžbine preko 13.000 RSD.",
  },
  {
    icon: "service",
    title: "Podrška kupcima",
    description: "Posvećena podrška za porudžbine, negu i veličine.",
  },
  {
    icon: "payment",
    title: "Sigurno plaćanje",
    description: "Sigurna i šifrovana naplata karticama i drugim metodama.",
  },
  {
    icon: "contact",
    title: "Kontakt",
    description: "hello@niti.home — odgovaramo u roku od jednog radnog dana.",
  },
];
