/**
 * Početni loader (NITI.) na home stranici dok se hero video/slika učitava.
 */
export const entranceLoaderConfig = {
  /** Uključi/isključi loader */
  enabled: true,
  /** Minimalno vreme prikaza — sprečava prebrz „blink“ */
  minDurationMs: 700,
  /** Maksimalno čekanje pre nego što loader nestane i bez videa */
  maxDurationMs: 2800,
  /** Jednom po sesiji (ne pri svakom povratku na početnu) */
  oncePerSession: true,
};
