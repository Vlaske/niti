import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Privatnost" };

export default function PrivatnostPage() {
  return (
    <LegalPage title="Politika privatnosti">
      <p>
        NITI. obrađuje lične podatke potrebne za porudžbinu, dostavu i
        komunikaciju (ime, adresa, email, telefon). Plaćanje obrađuje Shopify
        i njihovi procesori - mi ne čuvamo podatke o karticama.
      </p>
      <p>
        Prijava na newsletter čuva vašu email adresu radi novosti o
        kolekcijama i nezi tekstila. Odjava je moguća u svakom mailu, ili
        pisanjem na info@nitihome.rs.
      </p>
      <p>
        Za zahteve oko pristupa ili brisanja podataka pišite na{" "}
        <a
          href="mailto:info@nitihome.rs"
          className="text-niti-charcoal underline underline-offset-2"
        >
          info@nitihome.rs
        </a>
        .
      </p>
    </LegalPage>
  );
}
