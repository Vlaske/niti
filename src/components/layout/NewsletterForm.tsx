"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Status = "idle" | "sending" | "done" | "invalid" | "error";

export function NewsletterForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");

  if (status === "done") {
    return (
      <p className="text-sm text-white" role="status">
        {t("footer.newsletterThanks")}
      </p>
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
            setStatus("done");
            return;
          }
          setStatus(json.error === "invalid" ? "invalid" : "error");
        } catch {
          setStatus("error");
        }
      }}
    >
      <div className="flex w-full flex-col overflow-hidden rounded-md bg-white sm:flex-row">
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
