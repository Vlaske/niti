import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Privatnost" };

export default function PrivatnostPage() {
  return (
    <LegalPage title="Politika privatnosti">
      <p>
        NITI. obrađuje lične podatke potrebne za porudžbinu, dostavu i
        komunikaciju (ime, adresa, email, telefon). Plaćanje obrađuje Shopify
        i njihovi procesori — mi ne čuvamo podatke o karticama.
      </p>
      <p>
        Newsletter (ako se prijavite) koristimo samo za novosti i ponude.
        Možete se odjaviti u svakom emailu.
      </p>
      <p>
        Za zahteve oko pristupa ili brisanja podataka pišite na{" "}
        <a
          href="mailto:hello@niti.home"
          className="text-niti-charcoal underline underline-offset-2"
        >
          hello@niti.home
        </a>
        . Ova stranica je informativna — pre lansiranja usklađujemo je sa
        pravnim savetom i Shopify uslovima.
      </p>
    </LegalPage>
  );
}
