"use client";

/**
 * Root-layout failures (e.g. Shopify outage during promo fetch).
 * Must define its own <html>/<body> — does not nest under layout.tsx.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f7f4ef",
          color: "#2a2826",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 420 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.55,
              marginBottom: 12,
            }}
          >
            NITI.
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 500, margin: "0 0 12px" }}>
            Nešto nije u redu
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.7, margin: 0 }}>
            Privremeno ne možemo da učitamo prodavnicu. Pokušajte ponovo za
            trenutak.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 28,
              padding: "12px 24px",
              border: "none",
              borderRadius: 6,
              background: "#2a2826",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Pokušaj ponovo
          </button>
        </div>
      </body>
    </html>
  );
}
