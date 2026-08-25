import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = { title: "Povrati" };

export default function PovratiPage() {
  return (
    <LegalPage title="Povrati i zamene">
      <p>
        Neiskorišćene proizvode u originalnom stanju možete vratiti u roku od{" "}
        <strong className="font-medium text-niti-charcoal">30 dana</strong> od
        prijema.
      </p>
      <p>
        Za posteljinu i čaršave: ako ste otvorili pakovanje samo da
        proverite veličinu i proizvod nije korišćen, javite nam se — dogovaramo
        zamenu ili kredit gde je moguće.
      </p>
      <p>
        Za pokretanje povrata pišite na{" "}
        <a
          href="mailto:hello@niti.home"
          className="text-niti-charcoal underline underline-offset-2"
        >
          hello@niti.home
        </a>{" "}
        sa brojem porudžbine. Troškove povratne pošiljke dogovaramo od
        slučaja do slučaja.
      </p>
    </LegalPage>
  );
}
