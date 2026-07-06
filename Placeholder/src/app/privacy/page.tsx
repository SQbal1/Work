import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { LegalLayout, LegalSection, LegalList } from "@/components/marketing/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Invoice X handles data on its marketing site: privacy-first, cookieless analytics and manual pilot-request handling for Saudi & GCC SMEs.",
  alternates: { canonical: "/privacy" },
};

const mail = `mailto:${brand.supportEmail}`;

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      intro={`How ${brand.name} collects, uses, and protects information on this site. ${brand.name} is an early pilot product, and we keep data collection deliberately minimal.`}
    >
      <LegalSection number="01" heading="Who this covers">
        <p>
          This policy applies to the {brand.name} marketing website and the pilot-request process. It
          does not cover any separate agreement we put in place with you once a pilot begins. That is
          handled directly and in writing.
        </p>
        <p>
          {brand.name} is a prototype invoicing product for small businesses in {brand.country} and the
          wider GCC. It is not yet a production billing system.
        </p>
      </LegalSection>

      <LegalSection number="02" heading="What we collect">
        <p>We only collect two kinds of information, and only what we genuinely need:</p>
        <LegalList
          items={[
            <>
              <strong className="text-bone">Pilot requests.</strong> When you submit the pilot form we
              receive the name, company, email, business type, and the optional note you choose to
              share.
            </>,
            <>
              <strong className="text-bone">Usage analytics.</strong> We measure anonymous,
              aggregate usage to understand what is useful: which pages are viewed and a few product
              events, such as starting the demo or submitting a pilot request.
            </>,
          ]}
        />
        <p>
          We do not run advertising trackers, and we do not buy or enrich data about you from third
          parties.
        </p>
      </LegalSection>

      <LegalSection number="03" heading="Cookieless, privacy-first analytics">
        <p>
          Our analytics are configured to be as light-touch as possible. Specifically, the analytics
          on this site:
        </p>
        <LegalList
          items={[
            "Set no cookies and write nothing to your device; measurement is in-memory only and is forgotten when you close the tab.",
            "Do not track you across other websites and do not build a long-term profile of you.",
            "Capture page views and a small set of explicit product events, not your keystrokes or screen recordings.",
            "Are processed in the European Union by our analytics provider (PostHog).",
          ]}
        />
        <p>
          Because no cookies or device storage are used for analytics, there is no tracking to switch
          off, but you can always block analytics with your browser or an extension if you prefer.
        </p>
      </LegalSection>

      <LegalSection number="04" heading="How we use information">
        <LegalList
          items={[
            "To reply to your pilot request and arrange onboarding.",
            "To understand, in aggregate, how the site and demo are used so we can improve them.",
            "To keep the service secure and prevent spam or abuse of the form.",
          ]}
        />
        <p>
          We do not use your information to make automated decisions about you, and we do not sell it.
        </p>
      </LegalSection>

      <LegalSection number="05" heading="Who processes data for us">
        <p>
          We keep our stack small and use trusted processors rather than building our own data
          infrastructure during the pilot:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-bone">Formspree</strong>: receives and stores pilot-request
              form submissions so we can read and reply to them.
            </>,
            <>
              <strong className="text-bone">PostHog (EU)</strong>: processes the anonymous usage
              analytics described above, hosted in the European Union.
            </>,
          ]}
        />
        <p>Each provider handles your data under its own privacy terms and only on our instructions.</p>
      </LegalSection>

      <LegalSection number="06" heading="How long we keep it">
        <p>
          We keep pilot-request details only as long as needed to evaluate and run the pilot, and we
          remove them on request. Anonymous analytics are retained in aggregate and are not tied to
          your identity.
        </p>
      </LegalSection>

      <LegalSection number="07" heading="Your choices and rights">
        <p>
          You can ask us to access, correct, or delete the information you submitted through the pilot
          form at any time. Just email{" "}
          <a href={mail} className="text-signal underline-offset-2 hover:underline">
            {brand.supportEmail}
          </a>{" "}
          and we will action it.
        </p>
      </LegalSection>

      <LegalSection number="08" heading="Changes to this policy">
        <p>
          As {brand.name} moves beyond the pilot, this policy will grow more detailed. We will update
          the date at the top whenever it changes. If you have questions, see our{" "}
          <Link href="/contact" className="text-signal underline-offset-2 hover:underline">
            contact page
          </Link>
          .
        </p>
        <p className="text-xs text-ash">
          This policy is provided in good faith for an early pilot and is not legal advice.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
