"use client";

import Link from "next/link";
import { CATEGORY_GROUPS, getGroupHref } from "@/config/store-categories";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { ScrollableNav } from "@/components/shop/ScrollableNav";

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
      <div className="mx-auto max-w-[1440px]">
        <ScrollableNav>
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
        </ScrollableNav>
      </div>
    </nav>
  );
}
