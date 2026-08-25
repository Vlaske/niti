import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Nega tekstila" };

export default function NegaPage() {
  return (
    <LegalPage title="Vodič za negu">
      <p>
        Svaki proizvod ima svoje preporuke — uvek proverite etiketu. Opšta
        pravila za kućni tekstil:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Perite odvojeno prvih nekoliko puta, naročito intenzivne boje.</li>
        <li>Blagi deterdžent, umerena temperatura, bez jakog izbeljivača.</li>
        <li>Peškiri: ne pretrpavajte mašinu — frotir treba prostor da se ispere.</li>
        <li>Posteljina: okrenite naopako, sušite umereno ili na vazduhu.</li>
        <li>Dekorativni tekstil: češće blago osvežavanje nego agresivno pranje.</li>
      </ul>
      <p>
        Ako niste sigurni za konkretan artikal, pošaljite nam naziv proizvoda
        — rado ćemo predložiti režim nege.
      </p>
    </LegalPage>
  );
}
