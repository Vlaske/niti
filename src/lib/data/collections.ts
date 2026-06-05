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
