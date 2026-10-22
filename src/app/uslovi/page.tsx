import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Uslovi korišćenja" };

export default function UsloviPage() {
  return (
    <LegalPage title="Uslovi korišćenja">
      <p>
        Korišćenjem sajta NITI. prihvatate da je ponuda informativna, a
        porudžbina nastaje tek nakon uspešnog plaćanja. Cene su u RSD i
        mogu se menjati.
      </p>
      <p>
        Slike proizvoda su ilustrativne; boje mogu blago odstupati zbog
        ekrana i serije. Zadržavamo pravo da otkažemo porudžbinu u slučaju
        greške u ceni ili nedostupnosti, uz obaveštenje kupca.
      </p>
      <p>
        Za sporove primenjuje se pravo Republike Srbije. Kontakt:{" "}
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
