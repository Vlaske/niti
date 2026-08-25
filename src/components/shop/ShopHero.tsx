import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ShopHeroCrumb = {
  label: string;
  href?: string;
};

type ShopHeroProps = {
  image: string;
  title: string;
  description?: string;
  crumbs: ShopHeroCrumb[];
  className?: string;
};

/**
 * Compact catalog hero: photo + dark scrim so title stays readable,
 * then a clean handoff to the cream page below (no cream fade under white type).
 */
export function ShopHero({
  image,
  title,
  description,
  crumbs,
  className,
}: ShopHeroProps) {
  return (
    <section
      className={cn(
        "relative min-h-[32vh] overflow-hidden sm:min-h-[36vh] md:min-h-[42vh]",
        className
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Top: keep header readable; bottom: solid dark band for title */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/70" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="relative mx-auto flex min-h-[32vh] max-w-[1440px] flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[36vh] sm:pb-12 sm:pt-28 md:min-h-[42vh] md:px-8 md:pb-14 md:pt-32 lg:px-12">
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-white/70 sm:text-sm">
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-white/40">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="interactive hover:text-white">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="font-serif text-3xl font-medium leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 md:mt-4 md:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
