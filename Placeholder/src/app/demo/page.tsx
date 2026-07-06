import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { DemoWalkthrough } from "@/components/marketing/DemoWalkthrough";
import { buttonStyles } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "A guided, front-end demo of the Invoice X invoicing workflow: customer record, VAT-aware invoice, VAT readiness, and payment status tracking. Runs on demo data, no account needed.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-signal">
      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
      {children}
    </span>
  );
}

export default function DemoPage() {
  return (
    <div className="bg-canvas text-bone">
      <MarketingNav />

      {/* Demo hero */}
      <section className="border-b border-hairline py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <Eyebrow>Guided demo</Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
              A guided demo of the invoicing workflow
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-fog">
              This is a guided demo workspace running on demo data. No account, no sign-up, nothing
              saved. Step through the core workflow to see how the product fits together.
            </p>
            <p className="mt-4 text-base font-medium leading-relaxed text-cloud">
              Walk through how a client request becomes a VAT-aware invoice with payment status.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#start-walkthrough" className={buttonStyles("primary", "lg")}>
                Start walkthrough <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/pricing" className={buttonStyles("secondary", "lg")}>
                Request pilot access
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
                Demo data only
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                No account required
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                <MousePointerClick className="h-3.5 w-3.5 text-signal" />
                Interactive · 4 steps
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Interactive walkthrough */}
      <section id="walkthrough" className="scroll-mt-20 border-b border-hairline bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Walkthrough</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
              Customer → Invoice → VAT readiness → Payment
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fog">
              Browse the four steps at your own pace, or start the guided walkthrough, a
              spotlighted tutorial where you perform each action on demo data.
            </p>
          </Reveal>
          {/* No transform/opacity wrapper here: the tutorial overlay relies on a clean
              stacking context to spotlight the active panel above the dimmed page. */}
          <div className="mt-10">
            <DemoWalkthrough />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
              Want to run this on your own invoices?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-fog">
              The demo shows the workflow on sample data. Pilot teams get hands-on onboarding and a
              direct feedback loop, free during the pilot.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/pricing" className={buttonStyles("primary", "lg")}>
                Request pilot access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/features" className={buttonStyles("secondary", "lg")}>
                See all features
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
