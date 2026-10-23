import fs from "node:fs";
import path from "node:path";
import type { HeroSlide } from "@/types";

const EXTENSIONS = [".jpg", ".jpeg", ".JPG", ".JPEG", ".png", ".webp"];

/**
 * Your photo in public/site, when the file exists.
 * Otherwise the Unsplash address passed in.
 */
export function preferSiteImage(baseName: string, fallback: string): string {
  const root = path.join(process.cwd(), "public", "site");
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(root, `${baseName}${ext}`))) {
      return `/site/${baseName}${ext}`;
    }
  }
  return fallback;
}

const HERO_FILES: Record<string, string> = {
  "1": "home/hero-spavaca-soba",
  "2": "home/hero-kupatilo",
  "3": "home/hero-kuhinja",
};

export function resolveHeroSlides(slides: HeroSlide[]): HeroSlide[] {
  return slides.map((slide) => {
    const file = HERO_FILES[slide.id];
    if (!file) return slide;
    const image = preferSiteImage(file, slide.image);
    return {
      ...slide,
      image,
      poster: slide.poster ? preferSiteImage(file, slide.poster) : image,
    };
  });
}

const SHOWCASE_FILES: Record<string, string> = {
  "1": "home/showcase-posteljina",
  "2": "home/showcase-jastuk",
  "3": "home/showcase-peskir",
};

export function resolveShowcasePoster(id: string, fallback: string): string {
  const file = SHOWCASE_FILES[id];
  return file ? preferSiteImage(file, fallback) : fallback;
}
