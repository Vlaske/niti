"use client";

import Link from "next/link";
import { CATEGORY_GROUPS, getGroupHref } from "@/config/store-categories";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type RoomNavStripProps = {
  activeId?: string;
};

/** Used on /shop (all products) — rooms as the primary browse level */
export function RoomNavStrip({ activeId }: RoomNavStripProps) {
  const { t } = useLanguage();

  const linkClass = (active: boolean) =>
    cn(
      "interactive shrink-0 border-b py-2 text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.16em] md:py-1 md:text-xs",
      active
        ? "border-niti-charcoal text-niti-charcoal"
        : "border-transparent text-niti-muted hover:text-niti-charcoal"
    );

  return (
    <nav className="border-b border-niti-line bg-niti-cream">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="flex gap-x-5 overflow-x-auto py-3 scrollbar-hide md:flex-wrap md:gap-x-8 md:overflow-visible md:py-5">
          <Link
            href="/shop"
            className={linkClass(!activeId || activeId === "all")}
          >
            {t("nav.allProducts")}
          </Link>
          {CATEGORY_GROUPS.map((room) => (
            <Link
              key={room.id}
              href={getGroupHref(room.id)}
              className={linkClass(activeId === room.id)}
            >
              {room.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
