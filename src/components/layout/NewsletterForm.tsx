"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "invalid" | "error";

export function NewsletterForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "done" || !successRef.current) return;
    const el = successRef.current;
    const logo = el.querySelector("[data-thanks-logo]");
    const copy = el.querySelector("[data-thanks-copy]");
    gsap.fromTo(
      el,
      { opacity: 0, y: 16, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power2.out" }
    );
    if (logo) {
      gsap.fromTo(
        logo,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.45, delay: 0.08, ease: "power2.out" }
      );
    }
    if (copy) {
      gsap.fromTo(
        copy,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.16, ease: "power2.out" }
      );
    }
    return () => gsap.killTweensOf([el, logo, copy].filter(Boolean));
  }, [status]);

  if (status === "done") {
    return (
      <div
        ref={successRef}
        role="status"
        className="w-full max-w-3xl overflow-hidden rounded-sm bg-[#1c3a2e] px-7 py-8 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:px-10 sm:py-9 md:px-12 md:py-10"
      >
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-10 md:gap-14">
          <div
            data-thanks-logo
            className="shrink-0 text-center text-[#f2ebe2]"
          >
            <p className="font-serif text-[2.35rem] font-semibold leading-none tracking-[0.14em] sm:text-[2.6rem] md:text-[2.85rem]">
              NITI.
            </p>
            <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.42em] text-[#f2ebe2]/85">
              Home
            </p>
          </div>

          <div
            data-thanks-copy
            className="min-w-0 max-w-md text-center sm:border-l sm:border-[#f2ebe2]/20 sm:pl-10 sm:text-left md:pl-12"
          >
            <p className="font-serif text-xl font-medium uppercase leading-snug tracking-[0.04em] text-[#f2ebe2] sm:text-2xl md:text-[1.65rem]">
              {t("footer.newsletterThanksTitle")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#f2ebe2]/82 md:text-[0.95rem]">
              {t("footer.newsletterThanks")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center text-center text-white">
      <h2 className="mb-2 font-serif text-xl font-medium md:mb-3 md:text-3xl">
        {t("footer.newsletter")}
      </h2>
      <p className="mb-6 text-xs text-white/85 md:mb-8 md:text-base">
        {t("footer.newsletterSub")}
      </p>
      <form
        className="flex w-full max-w-lg flex-col gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          if (status === "sending") return;
          const data = new FormData(event.currentTarget);
          const email = String(data.get("email") || "").trim();
          const website = String(data.get("website") || "");
          if (!email) {
            setStatus("invalid");
            return;
          }
          setStatus("sending");
          try {
            const res = await fetch("/api/newsletter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, website }),
            });
            const json = (await res.json()) as { ok?: boolean; error?: string };
            if (json.ok) {
              setStatus("done");
              return;
            }
            setStatus(json.error === "invalid" ? "invalid" : "error");
          } catch {
            setStatus("error");
          }
        }}
      >
        <div
          className={cn(
            "flex w-full flex-col overflow-hidden rounded-md bg-white transition-shadow duration-300 sm:flex-row",
            status === "invalid" || status === "error"
              ? "ring-2 ring-niti-sale/50"
              : "shadow-sm"
          )}
        >
          <input
            type="email"
            required
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t("footer.email")}
            className="min-h-12 flex-1 px-4 py-3.5 text-sm text-niti-charcoal outline-none"
            aria-label={t("footer.email")}
            aria-invalid={status === "invalid"}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="min-h-12 bg-niti-charcoal px-6 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-niti-footer disabled:opacity-70"
          >
            {status === "sending" ? t("footer.subscribing") : t("footer.subscribe")}
          </button>
        </div>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute h-px w-px overflow-hidden opacity-0"
          aria-hidden
        />
        {status === "invalid" || status === "error" ? (
          <p className="text-sm text-white" role="alert">
            {status === "invalid"
              ? t("footer.newsletterInvalid")
              : t("footer.newsletterError")}
          </p>
        ) : null}
      </form>
    </div>
  );
}
