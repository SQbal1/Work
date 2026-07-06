import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Rocket, MapPin, MessageCircle } from "lucide-react";
import { brand, whatsappLink, whatsappDisplay } from "@/config/brand";
import { LegalLayout } from "@/components/marketing/LegalLayout";
import { Reveal } from "@/components/marketing/Reveal";
import { buttonStyles } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${brand.name} team about the pilot, partnerships, or questions about VAT-aware invoicing for Saudi & GCC SMEs.`,
  alternates: { canonical: "/contact" },
};

const mail = `mailto:${brand.supportEmail}`;
const waMessage = `Hi, I'd like to ask about the ${brand.name} pilot.`;
const whatsappContacts = brand.whatsappContacts;

export default function ContactPage() {
  return (
    <LegalLayout
      eyebrow="Contact"
      title="Get in touch"
      intro={`${brand.name} is a small, hands-on pilot. You'll reach a real person, not a ticketing queue. Here's the fastest way to get what you need.`}
      lastUpdated={null}
    >
      {/* Primary paths */}
      <Reveal className="grid gap-4 sm:grid-cols-2">
        {/* Pilot access — routes to the form (single capture path) */}
        <div className="flex h-full flex-col rounded-[10px] border border-signal/35 bg-ink p-6">
          <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-signal/30 bg-signal/10 text-signal">
            <Rocket className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-lg font-semibold tracking-tight text-bone">
            Request pilot access
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fog">
            Want to try it on your own invoices? The pilot form is the quickest path. It goes
            straight to us for manual onboarding.
          </p>
          <Link
            href="/pricing#request"
            className={buttonStyles("primary", "md", "mt-6 w-full sm:w-auto")}
          >
            Open the pilot form <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Direct email */}
        <div className="flex h-full flex-col rounded-[10px] border border-hairline bg-ink p-6">
          <span className="grid h-10 w-10 place-items-center rounded-[10px] border border-hairline bg-canvas text-cloud">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-lg font-semibold tracking-tight text-bone">
            Email us directly
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fog">
            Questions, feedback, partnerships, or anything else? Write to us and we&apos;ll usually
            reply within a day.
          </p>
          <a
            href={mail}
            className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-signal transition hover:text-bone"
          >
            {brand.supportEmail}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Reveal>

      {/* WhatsApp — Gulf-standard channel. Only renders once a number is set. */}
      {whatsappContacts.length > 0 ? (
        <Reveal className="rounded-[10px] border border-hairline bg-ink p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-signal/30 bg-signal/10 text-signal">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-bone">
                Message us on WhatsApp
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-fog">
                Often the fastest way to reach us during the pilot.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {whatsappContacts.map((c) => (
              <a
                key={c.number}
                href={whatsappLink(c.number, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-[10px] border border-hairline bg-canvas px-4 py-3 transition hover:border-graphite"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-bone">{c.name}</span>
                  <span className="nums-tabular mt-0.5 block font-mono text-xs text-fog">
                    {whatsappDisplay(c.number)}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-signal transition-transform group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* Region note */}
      <Reveal className="rounded-[10px] border border-hairline bg-canvas/60 p-6">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-fog">
          <MapPin className="h-4 w-4 text-signal" />
          Where we work
        </div>
        <p className="mt-3 text-sm leading-relaxed text-fog">
          Built for small businesses in {brand.country} and the wider GCC. We&apos;re running a focused
          pilot right now, so onboarding is manual and spots are limited. Reaching out early helps.
        </p>
      </Reveal>
    </LegalLayout>
  );
}
