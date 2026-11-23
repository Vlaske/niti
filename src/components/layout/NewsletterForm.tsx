"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { gsap } from "gsap";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "invalid" | "error";

export function NewsletterForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");
  const [toastVisible, setToastVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status !== "done" || !successRef.current) return;
    const el = successRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 12, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
    );
    const check = el.querySelector("[data-check]");
    if (check) {
      gsap.fromTo(
        check,
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, delay: 0.12, ease: "back.out(1.6)" }
      );
    }
    return () => gsap.killTweensOf([el, check].filter(Boolean));
  }, [status]);

  useEffect(() => {
    if (!toastVisible || !toastRef.current) return;
    const el = toastRef.current;
    gsap.fromTo(
      el,
      { y: 28, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.35)" }
    );
    const hide = window.setTimeout(() => {
      gsap.to(el, {
        y: 16,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => setToastVisible(false),
      });
    }, 4200);
    return () => {
      window.clearTimeout(hide);
      gsap.killTweensOf(el);
    };
  }, [toastVisible]);

  if (status === "done") {
    return (
      <>
        <div
          ref={successRef}
          role="status"
          className="w-full max-w-lg rounded-xl border border-white/25 bg-white/95 px-5 py-6 text-left shadow-lg backdrop-blur-sm md:px-7 md:py-7"
        >
          <div className="flex items-start gap-4">
            <div
              data-check
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-niti-sage-deep text-white shadow-sm"
            >
              <Check className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-lg font-semibold tracking-tight text-niti-charcoal md:text-xl">
                {t("footer.newsletterThanksTitle")}
              </p>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-niti-sage-deep">
                {t("footer.newsletterThanks")}
              </p>
            </div>
          </div>
        </div>
        {mounted && toastVisible
          ? createPortal(
              <div
                ref={toastRef}
                role="status"
                className="pointer-events-none fixed bottom-24 left-4 right-4 z-[70] mx-auto max-w-sm md:left-auto md:right-8"
              >
                <div className="flex items-center gap-3 rounded-xl border border-niti-sage-deep/25 bg-white p-4 shadow-xl">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-niti-sage-deep text-white">
                    <Check className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-niti-charcoal">
                      {t("footer.newsletterThanksTitle")}
                    </p>
                    <p className="text-xs text-niti-muted">
                      {t("footer.newsletterThanks")}
                    </p>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}
      </>
    );
  }

  return (
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
            setToastVisible(true);
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
  );
}
