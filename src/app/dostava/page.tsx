import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Dostava" };

export default function DostavaPage() {
  return (
    <LegalPage title="Politika dostave">
      <p>
        Porudžbine šaljemo na teritoriji Srbije. Rok isporuke zavisi od
        dostupnosti artikala i kurirske službe — obično 1–5 radnih dana nakon
        potvrde porudžbine.
      </p>
      {/* Free-shipping threshold — uncomment when confirmed in Shopify
      <p>
        Besplatna standardna dostava važi za porudžbine preko{" "}
        <strong className="font-medium text-niti-charcoal">13.000 RSD</strong>.
        Ispod tog iznosa trošak dostave se prikazuje na Shopify checkout
        stranici pre plaćanja.
      </p>
      */}
      {/* Trošak se računa pri plaćanju — vrati kad iznos bude potvrđen
      <p>
        Trošak dostave prikazuje se na Shopify checkout stranici pre plaćanja,
        u zavisnosti od adrese i pošiljke.
      </p>
      */}
      <p>
        Tačna adresa i kontakt telefon su važni za uspešnu isporuku. Ako
        paket nije preuzet, kurir može naplatiti ponovnu dostavu prema svojim
        uslovima.
      </p>
    </LegalPage>
  );
}
