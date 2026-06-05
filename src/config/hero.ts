/**
 * Hero carousel — globalna podešavanja.
 * Slajdovi (slike/video): `src/config/hero-slides.ts`
 * Video fajlovi: `public/videos/`
 */
export const heroConfig = {
  /**
   * true = samo prvi slajd, video/slika u petlji, bez kontrola karusela.
   * Idealno za jedan product video na početnoj.
   */
  singleVideoLoop: true,
  /** Interval rotacije slajdova (ms) — ignoriše se kad je singleVideoLoop */
  autoplayMs: 7000,
};
