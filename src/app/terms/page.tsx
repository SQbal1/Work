import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { LegalLayout, LegalSection, LegalList } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms for using the Placeholder marketing site and early pilot — a prototype invoicing product for Saudi & GCC SMEs, not a production billing system.",
  alternates: { canonical: "/terms" },
};

const mail = `mailto:${brand.supportEmail}`;

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Terms"
      title="Terms of Use"
      intro={`The basic terms for using this site and taking part in the ${brand.name} pilot. Plain language, because the product is still early.`}
    >
      <LegalSection number="01" heading="A prototype, not a production system">
        <p>
          {brand.name} is an early-stage prototype shown for evaluation and feedback. It is offered as
          is, without warranties of any kind, and it should not be relied on for real financial,
          accounting, or tax records during the pilot.
        </p>
        <p>
          Anything you see in the demo workspace uses sample data and front-end-only state. It is for
          illustration, not for issuing live invoices to your customers.
        </p>
      </LegalSection>

      <LegalSection number="02" heading="No compliance guarantee">
        <p>
          {brand.name} provides a VAT-ready workflow foundation and VAT readiness checks. It does not
          claim official ZATCA compliance, and using it does not make your invoices compliant on its
          own. A final compliance review is required before any production use. See our{" "}
          <Link href="/compliance" className="text-signal underline-offset-2 hover:underline">
            VAT &amp; compliance notes
          </Link>{" "}
          for detail.
        </p>
      </LegalSection>

      <LegalSection number="03" heading="Using the site fairly">
        <p>When you use this site, you agree not to:</p>
        <LegalList
          items={[
            "Submit false information through the pilot form or impersonate someone else.",
            "Attempt to disrupt, probe, or overload the site or its providers.",
            "Scrape, copy, or reuse the content or design for a competing product.",
          ]}
        />
      </LegalSection>

      <LegalSection number="04" heading="The pilot">
        <p>
          Pilot access is arranged manually and is free during this stage. Taking part does not create
          an ongoing commitment for either side: you can stop at any time, and we may pause or change
          the pilot as we learn. Any paid plans shown on the site are planned, not yet available, and
          pricing is finalized after the pilot.
        </p>
      </LegalSection>

      <LegalSection number="05" heading="Intellectual property">
        <p>
          The {brand.name} name, branding, content, and design on this site belong to us. Feedback you
          choose to share about the product may be used to improve it, without obligation to you.
        </p>
      </LegalSection>

      <LegalSection number="06" heading="Liability">
        <p>
          To the extent permitted by law, {brand.name} and its makers are not liable for any loss
          arising from use of this prototype site or pilot. Because this is an evaluation product, you
          use it at your own discretion.
        </p>
      </LegalSection>

      <LegalSection number="07" heading="Changes and contact">
        <p>
          We may update these terms as the product develops; the date at the top reflects the latest
          version. Questions? Email{" "}
          <a href={mail} className="text-signal underline-offset-2 hover:underline">
            {brand.supportEmail}
          </a>{" "}
          or use our{" "}
          <Link href="/contact" className="text-signal underline-offset-2 hover:underline">
            contact page
          </Link>
          .
        </p>
        <p className="text-xs text-ash">
          These terms are provided in good faith for an early pilot and are not legal advice.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
