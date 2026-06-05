import type { HeroSlide } from "@/types";

/**
 * Hero slajdovi — slike i/ili video.
 *
 * VIDEO:
 * 1. Stavi .mp4 u `public/videos/` (npr. `public/videos/posteljina-hero.mp4`)
 * 2. Na slajdu dodaj:
 *    mediaType: "video",
 *    mediaSrc: "/videos/posteljina-hero.mp4",
 *    poster: "...", // slika dok se video učitava
 *
 * JEDAN VIDEO U PETLJI (bez karusela):
 * U `src/config/hero.ts` postavi `singleVideoLoop: true`
 *
 * MEŠAVINA VIDEO + SLIKA:
 * Svaki slajd može biti image ili video — karusel ih rotira redom.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "1",
    category: "Posteljina",
    headline: "MEKA HARMONIJA U SVAKOJ NITI",
    description:
      "Premium pamuk i lan za miran san i bezvremenski skandinavski mir — tekstil koji voli vaš dom.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85",
    productTag: "Premium tekstil — NITI.",
    ctaPrimary: { label: "view", href: "/shop/posteljine" },
    ctaSecondary: { label: "shop", href: "/shop" },
    mediaType: "video",
    mediaSrc: "/videos/bedding-video-hero.mp4",
    poster:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85",
  },
  {
    id: "2",
    category: "Peškiri",
    headline: "SVAKA NEŽNA LINIJA",
    description:
      "Spa težina frotira i profinjeni rubovi — kupatilski tekstil koji je lep koliko i prijatan.",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&q=85",
    productTag: "Peškiri — NITI.",
    ctaPrimary: { label: "view", href: "/shop/peskiri" },
    ctaSecondary: { label: "shop", href: "/shop" },
  },
  {
    id: "3",
    category: "Istaknuto",
    headline: "ORGANSKI KOMFOR U FOKUSU",
    description:
      "Svako tkanje i završna obrada osmišljeni su s namerom — spoj komfora, izdržljivosti i pastelnog mira.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85",
    ctaPrimary: { label: "view", href: "/shop" },
    ctaSecondary: { label: "explore", href: "/shop/posteljine" },
  },
];
