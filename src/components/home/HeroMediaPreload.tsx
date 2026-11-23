import type { HeroSlide } from "@/types";

/**
 * Preload only the hero still (poster/image).
 * Do not preload the MP4 as fetch — the <video> element loads it itself;
 * a separate fetch preload often doubles bandwidth and does not prevent poster snap.
 */
export function HeroMediaPreload({ slides }: { slides: HeroSlide[] }) {
  const slide = slides[0];
  if (!slide) return null;
  const mediaType = slide.mediaType ?? "image";
  const poster =
    mediaType === "video"
      ? (slide.poster ?? slide.image)
      : (slide.mediaSrc ?? slide.image);

  return <link rel="preload" href={poster} as="image" />;
}
