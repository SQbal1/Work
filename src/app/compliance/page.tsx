import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { LegalLayout, LegalSection, LegalList } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "VAT & Compliance",
  description:
    "Where Placeholder stands on VAT and ZATCA — a VAT-ready workflow foundation for Saudi & GCC SMEs, not certified ZATCA compliance.",
  alternates: { canonical: "/compliance" },
};

export default function CompliancePage() {
  return (
    <LegalLayout
      eyebrow="VAT & compliance"
      title="VAT & compliance"
      intro={`Exactly what ${brand.name} does and does not claim about VAT and ZATCA — stated plainly so there is no confusion.`}
    >
      <LegalSection number="01" heading="What Placeholder is">
        <p>
          {brand.name} gives small businesses a cleaner, VAT-aware invoicing workflow: structured
          customer records, per-line VAT at the standard {brand.country} rate of{" "}
          {Math.round(brand.vatRate * 100)}%, readiness checks before sending, and clear payment
          status. The goal is to reduce manual re-entry and make invoices easier to get right.
        </p>
      </LegalSection>

      <LegalSection number="02" heading="What Placeholder is not">
        <p>
          {brand.name} does <strong className="text-bone">not</strong> claim official ZATCA
          compliance, and it is not a certified e-invoicing or Fatoorah integration. In particular,
          during this stage it does not:
        </p>
        <LegalList
          items={[
            "Integrate directly with ZATCA or submit invoices to any tax authority.",
            "Generate a ZATCA-certified cryptographic stamp, or clear or report invoices with ZATCA.",
            "Replace advice from a qualified accountant or tax advisor.",
          ]}
        />
        <p>
          Invoices can optionally generate a UBL XML file with a hash chain and digital signature —
          but that signature comes from a self-signed development key generated locally, not a
          ZATCA-issued Cryptographic Stamp Identifier (CSID). It demonstrates the structure of the
          workflow, not a compliance guarantee.
        </p>
        <p>
          We describe this as a <strong className="text-bone">VAT-ready workflow foundation</strong>{" "}
          rather than certified compliance, on purpose.
        </p>
      </LegalSection>

      <LegalSection number="03" heading="Before production use">
        <p>
          A final compliance review is required before you rely on any invoice produced during the
          pilot for official purposes. You remain responsible for meeting your own VAT and ZATCA
          obligations, and we recommend confirming requirements with your accountant or directly with
          ZATCA.
        </p>
      </LegalSection>

      <LegalSection number="04" heading="Where this is heading">
        <p>
          Deeper compliance — including official ZATCA integration — is on the roadmap for after the
          pilot, once we have validated the core workflow with real businesses. We would rather ship
          honest readiness today than overclaim compliance we have not certified.
        </p>
        <p>
          Questions about VAT handling or the roadmap? See our{" "}
          <Link href="/contact" className="text-signal underline-offset-2 hover:underline">
            contact page
          </Link>
          .
        </p>
        <p className="text-xs text-ash">
          This page is informational and is not tax or legal advice.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
