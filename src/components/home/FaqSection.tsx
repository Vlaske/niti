"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { useRef, useState } from "react";
import { useScrollReveal } from "@/lib/animations";
import { FAQ_SECTION_IMAGE } from "@/config/placeholders";
import { faqItems } from "@/lib/data/collections";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const { t } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  useScrollReveal(ref, { selector: "[data-faq-reveal]" });

  return (
    <section ref={ref} id="faq" className="bg-niti-cream">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
        <div className="relative min-h-[360px] lg:min-h-[640px]">
          <Image
            src={FAQ_SECTION_IMAGE}
            alt="Mekana posteljina i miran enterijer — NITI."
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="bg-niti-sand px-4 py-14 md:px-10 md:py-20 lg:px-14">
          <div
            data-faq-reveal
            className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <h2 className="text-2xl font-semibold text-niti-charcoal md:text-3xl">
              {t("home.faqTitle")}
            </h2>
            <p className="max-w-xs text-sm text-niti-muted">
              {t("home.faqHint")}
            </p>
          </div>

          <ul className="divide-y divide-niti-charcoal/10">
            {faqItems.map((item) => {
              const open = openId === item.id;
              return (
                <li key={item.id} data-faq-reveal>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId(open ? null : item.id)
                    }
                    className="interactive flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-sm font-medium text-niti-charcoal md:text-base">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-niti-charcoal/15 transition-colors",
                        open && "bg-niti-charcoal text-white"
                      )}
                    >
                      {open ? (
                        <Minus className="h-4 w-4" strokeWidth={1.5} />
                      ) : (
                        <Plus className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300",
                      open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                    )}
                  >
                    <p className="overflow-hidden text-sm leading-relaxed text-niti-muted">
                      {item.answer}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
