import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  FileText,
  ListChecks,
  Percent,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Features",
  description:
    "A focused invoicing workspace for small businesses — customer records, invoice generation, VAT-aware totals, and payment tracking in one place.",
};

// Single lead-capture path — all pilot CTAs land on the form (/pricing#request).
const PILOT_HREF = "/pricing#request";

const PILOT_INCLUDES = [
  "Manual onboarding",
  "Customer records",
  "Invoice creation",
  "VAT-aware totals",
  "Payment tracking",
  "Direct feedback loop",
];

/* ------------------------------------------------------------------ */
/* Shared design primitives — match ProductWorkspaceShowcase language  */
/* ------------------------------------------------------------------ */

type StatusTone = "draft" | "sent" | "open" | "paid";

const STATUS_STYLES: Record<StatusTone, string> = {
  draft: "border-hairline bg-ink text-fog",
  sent: "border-graphite/70 bg-ink text-cloud",
  open: "border-signal/30 bg-signal/10 text-signal",
  paid: "border-signal/25 bg-signal/[0.07] text-signal",
};

function StatusPill({ status }: { status: StatusTone }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

function PanelTag({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
      {Icon ? <Icon className="h-3.5 w-3.5 text-signal" /> : null}
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-signal">
      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero workspace preview — three live invoice rows                    */
/* ------------------------------------------------------------------ */

const HERO_INVOICES: {
  id: string;
  customer: string;
  amount: string;
  status: StatusTone;
}[] = [
  { id: "INV-1207", customer: "Bayan Technologies", amount: "SAR 13,800", status: "open" },
  { id: "INV-1206", customer: "Najd Logistics", amount: "SAR 8,200", status: "sent" },
  { id: "INV-1205", customer: "Areeb Studio", amount: "SAR 5,400", status: "paid" },
];

function HeroWorkspacePreview() {
  return (
    <div className="mt-10 overflow-hidden rounded-[4px] border border-hairline bg-canvas text-left">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
          workspace · invoices
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-fog">
          <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal" />
          Demo data
        </span>
      </div>
      <div className="divide-y divide-hairline">
        {HERO_INVOICES.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center gap-3 bg-ink px-4 py-3 sm:gap-4"
          >
            <span className="w-16 shrink-0 font-mono text-[11px] text-fog sm:w-20">
              {inv.id}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-cloud">
              {inv.customer}
            </span>
            <span className="hidden shrink-0 font-mono text-[11px] text-bone sm:inline">
              {inv.amount}
            </span>
            <StatusPill status={inv.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel 01 — Customer record                                          */
/* ------------------------------------------------------------------ */

function CustomerRecordPanel() {
  return (
    <div className="rounded-[4px] border border-hairline bg-canvas p-5">
      <PanelTag icon={UserRound}>customer.record</PanelTag>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border border-hairline bg-ink text-signal">
          <UserRound className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-bone">
            Bayan Technologies LLC
          </div>
          <div className="font-mono text-[11px] text-fog">customer.id · CUS-117</div>
        </div>
      </div>
      <div className="mt-4 rounded-[4px] border border-hairline bg-ink p-3 font-mono text-[11px]">
        <div className="flex justify-between gap-3">
          <span className="text-fog">vat_number</span>
          <span className="truncate text-cloud">300458921700003</span>
        </div>
        <div className="mt-2 flex justify-between gap-3">
          <span className="text-fog">contact</span>
          <span className="text-cloud">ahmad@bayan.sa</span>
        </div>
        <div className="mt-2 flex justify-between gap-3">
          <span className="text-fog">terms</span>
          <span className="text-cloud">Net 14 · SAR</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3 font-mono text-[11px] text-fog">
        <Check className="h-3.5 w-3.5 shrink-0 text-signal" />
        Reused across INV-1207 and 3 other invoices — no re-entry
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel 02 — Invoice builder                                          */
/* ------------------------------------------------------------------ */

const SERVICE_LINES = [
  { desc: "Consulting services", qty: 5, unit: 1200 },
  { desc: "Report preparation", qty: 1, unit: 800 },
] as const;

function InvoiceBuilderPanel() {
  const subtotal = SERVICE_LINES.reduce((acc, l) => acc + l.qty * l.unit, 0);
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + vat;

  return (
    <div className="rounded-[4px] border border-hairline bg-canvas p-5">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <PanelTag icon={FileText}>invoice.build</PanelTag>
        <span className="font-mono text-[11px] text-fog">INV-1208</span>
      </div>
      <div className="mt-3 font-mono text-[11px] text-fog">
        customer:{" "}
        <span className="text-cloud">Bayan Technologies · CUS-117</span>
      </div>
      <div className="mt-3 space-y-2">
        {SERVICE_LINES.map((line, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-[4px] border border-hairline bg-ink px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-xs text-cloud">{line.desc}</div>
              <div className="font-mono text-[10px] text-fog">
                {line.qty} × SAR {line.unit.toLocaleString()}
              </div>
            </div>
            <span className="shrink-0 font-mono text-xs text-bone">
              SAR {(line.qty * line.unit).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-[4px] border border-hairline bg-ink p-3 font-mono text-[11px]">
        <span className="text-fog">total · incl. VAT 15%</span>
        <span className="font-medium text-bone">SAR {total.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel 03 — VAT readiness                                            */
/* ------------------------------------------------------------------ */

const VAT_CHECKS = [
  "Seller VAT number present",
  "Customer VAT number validated",
  "Line items and totals matched",
];

function VATReadinessPanel() {
  return (
    <div className="rounded-[4px] border border-hairline bg-canvas p-5">
      <PanelTag icon={ListChecks}>vat.readiness</PanelTag>
      <div className="mt-4 space-y-2.5">
        {VAT_CHECKS.map((check) => (
          <div key={check} className="flex items-center gap-2.5">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-signal/30 bg-signal/10 text-signal">
              <Check className="h-3 w-3" />
            </span>
            <span className="text-sm text-cloud">{check}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[4px] border border-hairline bg-ink p-3 font-mono text-[11px]">
        <div className="flex justify-between">
          <span className="text-fog">subtotal</span>
          <span className="text-cloud">SAR 12,000</span>
        </div>
        <div className="mt-1.5 flex justify-between">
          <span className="text-fog">vat 15%</span>
          <span className="text-signal">SAR 1,800</span>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-hairline pt-1.5">
          <span className="text-fog">total</span>
          <span className="text-bone">SAR 13,800</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel 04 — Payment tracking                                         */
/* ------------------------------------------------------------------ */

const PAYMENT_STEPS = ["Draft", "Sent", "Open", "Paid"] as const;
const PAYMENT_ACTIVE = 2; // "Open"

function PaymentTrackingPanel() {
  return (
    <div className="rounded-[4px] border border-hairline bg-canvas p-5">
      <div className="flex items-center justify-between">
        <PanelTag icon={Wallet}>payment.timeline</PanelTag>
        <StatusPill status="open" />
      </div>
      <div className="mt-4 rounded-[4px] border border-hairline bg-ink px-3 py-2.5 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-fog">INV-1207</span>
          <span className="text-bone">SAR 13,800</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-fog">
          <Clock3 className="h-3 w-3 text-signal" />
          Due in 14 days · Bayan Technologies
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center">
          {PAYMENT_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                  i === PAYMENT_ACTIVE
                    ? "border-signal bg-signal"
                    : i < PAYMENT_ACTIVE
                      ? "border-signal/60 bg-signal/25"
                      : "border-graphite bg-canvas",
                )}
              >
                {i < PAYMENT_ACTIVE ? (
                  <Check className="h-2.5 w-2.5 text-signal" />
                ) : null}
                {i === PAYMENT_ACTIVE ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                ) : null}
              </span>
              {i < PAYMENT_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "h-px flex-1",
                    i < PAYMENT_ACTIVE ? "bg-signal/50" : "bg-hairline",
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em]">
          {PAYMENT_STEPS.map((step, i) => (
            <span
              key={step}
              className={
                i === PAYMENT_ACTIVE
                  ? "text-signal"
                  : i < PAYMENT_ACTIVE
                    ? "text-signal/60"
                    : "text-fog"
              }
            >
              {step}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-[4px] border border-hairline">
        <div className="grid grid-cols-4 font-mono">
          {PAYMENT_STEPS.map((step, i) => (
            <div
              key={step}
              className={cn(
                "py-1.5 text-center text-[10px] uppercase tracking-[0.04em]",
                i === PAYMENT_ACTIVE
                  ? "bg-signal text-ink"
                  : i < PAYMENT_ACTIVE
                    ? "bg-ink text-signal/60"
                    : "bg-ink text-fog",
              )}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-fog">
        receivable.status{" "}
        <span className="text-signal">/ tracking · not processing</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FeaturesPage() {
  return (
    <div className="bg-canvas text-bone">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-hairline py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <Eyebrow>Features</Eyebrow>
            <h1 className="mt-3 text-balance font-display text-4xl font-medium tracking-[0.025em] text-bone sm:text-5xl">
              Everything needed to move from customer to invoice to payment state
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-fog">
              A focused invoicing workspace for small businesses that need clarity, reusable
              records, VAT-aware totals, and visible receivables.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={PILOT_HREF} className={buttonStyles("primary", "lg")}>
                Request pilot access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className={buttonStyles("secondary", "lg")}>
                View pricing
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
                Free during pilot · limited spots
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                Built for Saudi &amp; GCC VAT
              </span>
            </div>
            <HeroWorkspacePreview />
          </Reveal>
        </div>
      </section>

      {/* Feature 01 — Customer records */}
      <section className="border-b border-hairline py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[4px] border border-hairline bg-canvas text-syntax-violet">
                <Users className="h-5 w-5" />
              </span>
              <Eyebrow>Customer records</Eyebrow>
            </div>
            <h2 className="mt-5 font-display text-2xl font-medium tracking-[0.025em] text-bone sm:text-3xl">
              Save a customer once, reuse them everywhere
            </h2>
            <p className="mt-3 text-base leading-relaxed text-fog">
              Keep client profiles in one place so you stop re-entering the same details on every
              invoice.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <CustomerRecordPanel />
          </Reveal>
        </div>
      </section>

      {/* Feature 02 — Invoice creation (alt: bg-ink, panel left) */}
      <section className="border-b border-hairline bg-ink py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <Reveal className="lg:order-2">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[4px] border border-hairline bg-canvas text-syntax-pink">
                <FileText className="h-5 w-5" />
              </span>
              <Eyebrow>Invoice creation</Eyebrow>
            </div>
            <h2 className="mt-5 font-display text-2xl font-medium tracking-[0.025em] text-bone sm:text-3xl">
              Create structured invoices in seconds
            </h2>
            <p className="mt-3 text-base leading-relaxed text-fog">
              Build a complete invoice from saved customers and service lines — no formatting by
              hand.
            </p>
          </Reveal>
          <Reveal delay={80} className="lg:order-1">
            <InvoiceBuilderPanel />
          </Reveal>
        </div>
      </section>

      {/* Feature 03 — VAT-aware workflow */}
      <section className="border-b border-hairline py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[4px] border border-hairline bg-canvas text-loop-green">
                <Percent className="h-5 w-5" />
              </span>
              <Eyebrow>VAT-aware workflow</Eyebrow>
            </div>
            <h2 className="mt-5 font-display text-2xl font-medium tracking-[0.025em] text-bone sm:text-3xl">
              VAT-aware totals and readiness checks
            </h2>
            <p className="mt-3 text-base leading-relaxed text-fog">
              Per-line VAT and a completeness checklist help you confirm an invoice is ready before
              sending.
            </p>
            <p className="mt-4 rounded-[4px] border border-hairline bg-canvas/60 p-3 text-xs leading-relaxed text-fog">
              Official ZATCA integration is not part of the MVP. The current goal is a cleaner
              VAT-aware workflow foundation, not certified compliance.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <VATReadinessPanel />
          </Reveal>
        </div>
      </section>

      {/* Feature 04 — Payment tracking (alt: bg-ink, panel left) */}
      <section className="border-b border-hairline bg-ink py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <Reveal className="lg:order-2">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[4px] border border-hairline bg-canvas text-key-lime">
                <Wallet className="h-5 w-5" />
              </span>
              <Eyebrow>Payment tracking</Eyebrow>
            </div>
            <h2 className="mt-5 font-display text-2xl font-medium tracking-[0.025em] text-bone sm:text-3xl">
              Know exactly what&apos;s still open
            </h2>
            <p className="mt-3 text-base leading-relaxed text-fog">
              Move each invoice through clear states so receivables stop hiding in chats and
              spreadsheets.
            </p>
          </Reveal>
          <Reveal delay={80} className="lg:order-1">
            <PaymentTrackingPanel />
          </Reveal>
        </div>
      </section>

      {/* Features CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="home-pilot-panel overflow-hidden rounded-[4px] border border-signal/35">
            <div className="grid lg:grid-cols-2">
              {/* left — pitch */}
              <div className="aurora relative p-8 sm:p-10">
                <div className="relative z-10">
                  <Eyebrow>Early access</Eyebrow>
                  <h2 className="mt-4 font-display text-3xl font-medium leading-[1.12] tracking-[0.025em] text-bone sm:text-4xl">
                    See it on your own invoices
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-fog">
                    Placeholder is in early pilot — manual onboarding, direct support, and
                    feedback-based improvements as you use it on real invoices.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                      <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
                      pilot.access <span className="text-signal">open</span>
                    </span>
                    <span className="font-mono text-[11px] text-fog">
                      Free during the pilot
                    </span>
                  </div>
                </div>
              </div>

              {/* right — included + CTAs */}
              <div className="border-t border-hairline bg-ink p-8 sm:p-10 lg:border-l lg:border-t-0">
                <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
                  Pilot includes
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {PILOT_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-cloud">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={PILOT_HREF}
                    className={buttonStyles("primary", "lg", "w-full sm:w-auto")}
                  >
                    Request pilot access <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/pricing"
                    className={buttonStyles("secondary", "lg", "w-full sm:w-auto")}
                  >
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
