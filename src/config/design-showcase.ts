/**
 * Sekcija „Gde dizajn oživljava“ — jedan fajl za sve izmene.
 *
 * Kako ažurirati:
 * 1. `productHandle` — Shopify handle proizvoda (isti kao u URL-u /product/…)
 * 2. Video: stavi .mp4 u `public/videos/showcase/`, zatim:
 *    mediaType: "video",
 *    mediaSrc: "/videos/showcase/ime-fajla.mp4",
 *    poster: "…", // cover dok se učitava
 * 3. Samo slika: izostavi mediaType ili stavi "image" + mediaSrc (URL ili putanja)
 *
 * Kartica ispod videa automatski povlači naziv, cenu i sliku iz Shopify-a.
 * Stavke čiji proizvod ne postoji se preskaču.
 */
export type DesignShowcaseEntry = {
  id: string;
  /** Shopify product handle — mora postojati u prodavnici */
  productHandle: string;
  /** Kratki tekst preko videa (srpski) */
  description: string;
  mediaType?: "image" | "video";
  /** Putanja (/videos/…) ili pun URL slike/videa */
  mediaSrc?: string;
  /** Cover za video ili fallback slika */
  poster?: string;
};

export const designShowcaseEntries: DesignShowcaseEntry[] = [
  {
    id: "1",
    productHandle: "pamucni-carsav-sa-lastisem",
    description:
      "Mekani slojevi i pastelnih tonova — posteljina koja poziva na odmor.",
    mediaType: "video",
    mediaSrc: "/videos/showcase/prekrivac-live.mp4",
    poster:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85",
  },
  {
    id: "2",
    productHandle: "jastuk-premium",
    description: "Savršena podrška i mekana tkanina — detalj koji čini razliku.",
    mediaType: "video",
    mediaSrc: "/videos/showcase/jastuk-live-1.mp4",
    poster:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=85",
  },
  {
    id: "3",
    productHandle: "luksuzni-pamucni-peskir-niti",
    description: "Osećaj kao kod kuće — peškiri koji voli vaša koža.",
    mediaType: "video",
    mediaSrc: "/videos/showcase/peskir-plaza-live.mp4",
    poster:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=85",
  },
];
