import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Faq } from "@/components/marketing/Faq";
import { Reveal } from "@/components/marketing/Reveal";
import { PilotRequestForm } from "@/components/marketing/PilotRequestForm";
import { buttonStyles } from "@/components/ui/Button";
import { PILOT_OFFER, FUTURE_TIERS, PILOT_NEXT_STEPS } from "@/data/marketing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free pilot access to a VAT-aware invoicing workflow for Saudi & GCC small businesses: customer records, VAT readiness, and payment tracking. Onboarded manually, no checkout yet.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-signal">
      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
      {children}
    </span>
  );
}

export default function PricingPage() {
  return (
    <div className="bg-canvas text-bone">
      <MarketingNav />

      {/* Pricing hero */}
      <section className="border-b border-hairline py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
              Free pilot access for Saudi &amp; GCC SMEs
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-fog">
              Invoice X is an invoicing workspace for Saudi &amp; GCC small businesses. Keep
              customer records, build VAT-aware invoices, check VAT readiness before sending, and
              track payment status in one place. Start free with a guided pilot before committing to
              a larger system.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
                Built for Saudi &amp; GCC VAT workflows
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                Early pilot · free access
              </span>
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#request" className={buttonStyles("primary", "lg")}>
                Request pilot access <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/features" className={buttonStyles("secondary", "lg")}>
                See how it works
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pilot offer + request form */}
      <section id="request" className="scroll-mt-20 border-b border-hairline py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-8">
          {/* left — the live offer */}
          <Reveal className="relative flex flex-col rounded-[10px] border border-signal/45 bg-canvas p-7">
            <span className="absolute -top-3 left-6 rounded-full border border-signal/25 bg-ink px-3 py-1 font-mono text-xs text-signal">
              Available now
            </span>
            <h2 className="font-display font-semibold tracking-tight text-bone">
              {PILOT_OFFER.name}
            </h2>
            <p className="mt-1 text-sm text-fog">{PILOT_OFFER.blurb}</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-semibold tracking-tight text-bone">
                {PILOT_OFFER.price}
              </span>
              <span className="text-sm text-fog">{PILOT_OFFER.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PILOT_OFFER.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2.5 text-sm text-cloud">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  {outcome}
                </li>
              ))}
            </ul>

            {/* What happens next */}
            <div className="mt-7 border-t border-hairline pt-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
                What happens next
              </div>
              <ol className="mt-4 space-y-3">
                {PILOT_NEXT_STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-cloud">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-signal/30 bg-signal/10 font-mono text-[11px] text-signal">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          {/* right — request form */}
          <Reveal delay={90}>
            <PilotRequestForm />
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8" delay={120}>
          <p className="text-center text-xs leading-relaxed text-fog">
            No automated checkout yet. Pilot access is handled manually so we can onboard early teams
            directly.
          </p>
        </Reveal>
      </section>

      {/* Coming after the pilot */}
      <section className="border-b border-hairline py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>For later</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
              Coming after the pilot
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fog">
              These tiers are planned, not yet available. Pricing is finalized after the pilot.
              Request pilot access now and you&apos;ll be first to hear.
            </p>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {FUTURE_TIERS.map((tier, i) => (
              <Reveal
                key={tier.name}
                className="flex flex-col rounded-[10px] border border-hairline bg-canvas/60 p-6"
                delay={i * 80}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-semibold tracking-tight text-bone">
                    {tier.name}
                  </h3>
                  <span className="shrink-0 rounded-full border border-hairline bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-fog">
                    After pilot
                  </span>
                </div>
                <p className="mt-2 text-sm text-fog">{tier.blurb}</p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-cloud">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fog" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-hairline bg-ink py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
              Pilot questions, answered
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fog">
              Short answers on pilot access, pricing, compliance, and what happens before production.
            </p>
            <a
              href="#request"
              className="mt-5 inline-flex items-center gap-2 text-sm text-signal transition hover:text-bone"
            >
              Still have a question? Request pilot access
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <Reveal className="mt-12" delay={120}>
            <Faq />
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
