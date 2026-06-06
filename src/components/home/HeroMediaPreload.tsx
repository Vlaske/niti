import { heroSlides } from "@/config/hero-slides";
import { heroConfig } from "@/config/hero";

function getActiveSlide() {
  return heroConfig.singleVideoLoop ? heroSlides[0] : heroSlides[0];
}

/** Preload hero medija u <head> radi bržeg prvog prikaza */
export function HeroMediaPreload() {
  const slide = getActiveSlide();
  const mediaType = slide.mediaType ?? "image";
  const poster = slide.poster ?? slide.image;
  const videoSrc =
    mediaType === "video" ? (slide.mediaSrc ?? slide.image) : null;

  return (
    <>
      <link rel="preload" href={poster} as="image" />
      {videoSrc && (
        <link
          rel="preload"
          href={videoSrc}
          as="fetch"
          type="video/mp4"
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
