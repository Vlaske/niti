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

  return (
    <nav className="border-b border-niti-line bg-niti-cream">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="scrollbar-hide flex gap-6 overflow-x-auto py-4 md:gap-8 md:py-5">
          <Link
            href="/shop"
            className={cn(
              "interactive shrink-0 border-b pb-1 text-[11px] font-medium uppercase tracking-[0.16em] md:text-xs",
              !activeId || activeId === "all"
                ? "border-niti-charcoal text-niti-charcoal"
                : "border-transparent text-niti-muted hover:text-niti-charcoal"
            )}
          >
            {t("nav.allProducts")}
          </Link>
          {CATEGORY_GROUPS.map((room) => {
            const active = activeId === room.id;
            return (
              <Link
                key={room.id}
                href={getGroupHref(room.id)}
                className={cn(
                  "interactive shrink-0 border-b pb-1 text-[11px] font-medium uppercase tracking-[0.16em] md:text-xs",
                  active
                    ? "border-niti-charcoal text-niti-charcoal"
                    : "border-transparent text-niti-muted hover:text-niti-charcoal"
                )}
              >
                {room.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
