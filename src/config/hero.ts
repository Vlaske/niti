/**
 * Hero carousel configuration
 *
 * VIDEO SETUP:
 * 1. Place your .mp4 file in `public/videos/` (e.g. `public/videos/bedsheet-hero.mp4`)
 * 2. Set `mediaType: "video"` and `videoSrc: "/videos/bedsheet-hero.mp4"` on a slide in heroSlides
 *
 * SINGLE VIDEO LOOP (no carousel):
 * Set `singleVideoLoop: true` — only the first slide plays, loops forever, controls hidden.
 */
export const heroConfig = {
  /** When true, only first slide is shown and video/image loops — no carousel rotation */
  singleVideoLoop: false,
  autoplayMs: 7000,
};
