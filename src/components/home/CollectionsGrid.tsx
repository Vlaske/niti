"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_GROUPS, getGroupHref } from "@/config/store-categories";

export function CollectionsGrid({
  images,
}: {
  images: Record<string, string>;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const rooms = CATEGORY_GROUPS.map((room) => ({
    ...room,
    image: images[room.id] ?? room.image,
  }));
  const featured = rooms.slice(0, 2);
  const rest = rooms.slice(2);

  useScrollReveal(ref, { selector: "[data-card]", stagger: 0.08 });

  return (
    <section ref={ref} className="bg-niti-cream py-10 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          title={t("home.shopByRoom")}
          viewAllHref="/shop"
          viewAllLabel={t("home.viewAll")}
        />
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-niti-muted md:text-base">
          {t("home.shopByRoomHint")}
        </p>

        {/* Mobile: all rooms visible in a 2-col grid — no sideways scroll */}
        <div className="mt-6 grid grid-cols-2 gap-2 md:hidden">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={getGroupHref(room.id)}
              data-card
              className="interactive group relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={room.image}
                alt={room.title}
                fill
                sizes="50vw"
                className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                <h3 className="font-serif text-lg font-semibold leading-tight sm:text-xl">
                  {room.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 hidden gap-px md:grid md:grid-cols-2">
          {featured.map((room) => (
            <Link
              key={room.id}
              href={getGroupHref(room.id)}
              data-card
              className="interactive group relative aspect-[16/9] overflow-hidden"
            >
              <Image
                src={room.image}
                alt={room.title}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-colors duration-500 group-hover:from-black/80" />
              <div className="absolute bottom-0 left-0 w-full p-6 text-white transition-transform duration-500 group-hover:translate-y-[-4px] lg:p-8">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
                  {t("shop.room")}
                </p>
                <h3 className="font-serif text-3xl font-semibold leading-tight lg:text-4xl">
                  {room.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-white/80 opacity-90 transition-opacity duration-500 group-hover:opacity-100">
                  {room.description}
                </p>
                <span className="mt-4 inline-block h-px w-0 bg-white/80 transition-all duration-500 group-hover:w-16" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-px hidden gap-px md:grid md:grid-cols-2 lg:grid-cols-4">
          {rest.map((room) => (
            <Link
              key={room.id}
              href={getGroupHref(room.id)}
              data-card
              className="interactive group relative aspect-[3/4] overflow-hidden"
            >
              <Image
                src={room.image}
                alt={room.title}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-colors duration-500 group-hover:from-black/80" />
              <div className="absolute bottom-0 left-0 w-full p-5 text-white transition-transform duration-500 group-hover:translate-y-[-3px]">
                <h3 className="font-serif text-xl font-semibold leading-tight lg:text-2xl">
                  {room.title}
                </h3>
                <span className="mt-3 inline-block h-px w-0 bg-white/70 transition-all duration-500 group-hover:w-12" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
