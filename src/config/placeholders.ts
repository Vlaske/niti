/**
 * Proverene Unsplash slike koje odgovaraju NITI. estetici (pastel, tekstil, enterijer).
 * Koristi ove umesto nasumičnih URL-ova koji mogu dati 404.
 */
export const PLACEHOLDER_IMAGES = {
  bedroom:
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85",
  interior:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85",
  towels:
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=85",
  linen:
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=85",
} as const;

/** FAQ sekcija — meka posteljina / miran enterijer */
export const FAQ_SECTION_IMAGE = PLACEHOLDER_IMAGES.bedroom;
