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

export const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "Šta prodaje NITI.?",
    answer:
      "Kućni tekstil za ceo dom: posteljine, čaršavi, jastuci, peškiri, stolnjaci, dekorativni tekstil, dečiji i hotelski program. Biramo komade koji lepo izgledaju u enterijeru i traju u svakodnevnoj upotrebi.",
  },
  {
    id: "2",
    question: "Kako da izaberem veličinu?",
    answer:
      "Na stranici proizvoda birate veličinu (npr. 160×200, 200×220) i boju pre dodavanja u korpu. Ako niste sigurni, pišite nam — pomoći ćemo oko dimenzija kreveta i čaršava.",
  },
  {
    id: "3",
    question: "Kako da negujem tekstil?",
    answer:
      "Uopšteno: blagi deterdžent, umerena temperatura, bez agresivnog izbeljivača. Tačna uputstva stoje uz proizvod; pamuk i frotir vole redovno pranje, a dekorativni komadi češće blago osvežavanje.",
  },
  // {
  //   id: "4",
  //   question: "Da li nudite besplatnu dostavu?",
  //   answer:
  //     "Da — besplatna standardna dostava za porudžbine preko 13.000 RSD. Tačan iznos i rokovi potvrđuju se na Shopify checkout stranici pre plaćanja.",
  // },
  {
    id: "4",
    question: "Kako funkcioniše dostava?",
    answer:
      "Trošak i rok dostave potvrđuju se na Shopify checkout stranici pre plaćanja, u zavisnosti od adrese i težine pošiljke. Šaljemo na teritoriji Srbije.",
  },
  {
    id: "5",
    question: "Koja je politika povrata?",
    answer:
      "Neiskorišćene artikle u originalnom stanju možete vratiti u roku od 30 dana. Detalje (troškovi, izuzeci za otvorenu posteljinu) dogovaramo putem podrške — pišite na hello@niti.home.",
  },
];

export const valueProps = [
  // Free-shipping promo — re-enable when threshold is confirmed in Shopify
  // {
  //   icon: "shipping",
  //   title: "Besplatna dostava",
  //   description: "Besplatna dostava za porudžbine preko 13.000 RSD.",
  // },
  {
    icon: "shipping",
    title: "Dostava",
    description: "Šaljemo širom Srbije — trošak i rok vidiš pri plaćanju.",
  },
  {
    icon: "service",
    title: "Podrška kupcima",
    description: "Pomoć oko veličina, nege i porudžbina — odgovaramo radnim danom.",
  },
  {
    icon: "payment",
    title: "Sigurno plaćanje",
    description: "Plaćanje preko Shopify checkout-a — kartice i dostupne metode.",
  },
  {
    icon: "contact",
    title: "Kontakt",
    description: "hello@niti.home — tu smo za pitanja o tekstilu i porudžbinama.",
  },
];
