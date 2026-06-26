import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Check,
  ShieldCheck,
  MapPin,
  Lock,
  Sparkles,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { SceneLine, SceneReveal } from "@/components/marketing/SceneReveal";
import { ScrollScene } from "@/components/marketing/ScrollScene";
import { Faq } from "@/components/marketing/Faq";
import { buttonStyles } from "@/components/ui/Button";
import { PROBLEMS, WORKFLOW, BUILT_FOR, MVP_FEATURES, PILOT_NEXT_STEPS } from "@/data/marketing";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

// Single lead-capture path: every "Request pilot access" CTA lands on the
// pilot form (/pricing#request) so submissions hit Formspree + the analytics
// funnel. The mailto is kept only as a low-friction "talk to us" fallback.
const PILOT_HREF = "/pricing#request";
const CONTACT_MAILTO = `mailto:${brand.supportEmail}?subject=${encodeURIComponent(
  `Question about ${brand.name}`,
)}`;

/* ------------------------------------------------------------------ */
/* Shared primitives — continue the technical panel language of the    */
/* hero + scroll story (mono tags, hairline borders, signal accents).  */
/* ------------------------------------------------------------------ */

type ChipTone = "signal" | "muted" | "red";

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: ChipTone }) {
  const tones: Record<ChipTone, string> = {
    signal: "border-signal/30 bg-ink text-signal",
    muted: "border-hairline bg-ink text-fog",
    red: "border-mute-red/30 bg-ink text-mute-red",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function IconBox({ icon: Icon, tone, well }: { icon: LucideIcon; tone: string; well: string }) {
  return (
    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[4px] border border-hairline", well, tone)}>
      <Icon className="h-5 w-5" />
    </span>
  );
}

function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  align = "left",
  size = "default",
}: {
  index: string;
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  size?: "default" | "lg";
}) {
  const titleClass = cn(
    "text-balance font-display font-medium leading-[1.12] tracking-[0.025em] text-bone",
    size === "lg" ? "text-3xl sm:text-4xl lg:text-5xl" : "text-3xl sm:text-4xl",
  );

  if (align === "center") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="text-signal">{index}</span>
          <span className="h-px w-8 bg-graphite" />
          <span className="text-fog">{eyebrow}</span>
        </div>
        <h2 className={titleClass}>{title}</h2>
        {lead ? <p className="max-w-xl text-sm leading-relaxed text-fog">{lead}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 border-t border-hairline pt-8 md:flex-row md:items-end md:justify-between md:gap-12">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="text-signal">{index}</span>
          <span className="h-px w-8 bg-graphite" />
          <span className="text-fog">{eyebrow}</span>
        </div>
        <h2 className={cn("mt-4", titleClass)}>{title}</h2>
      </div>
      {lead ? (
        <p className="max-w-sm text-sm leading-relaxed text-fog md:pb-1.5 md:text-right">{lead}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section 03 — Problem (three "broken state" panels)                  */
/* ------------------------------------------------------------------ */

const PROBLEM_TONES = ["text-cloud", "text-cloud", "text-cloud"];
const PROBLEM_CHIPS = ["scattered", "manual", "untracked"];

function ProblemFragment({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="space-y-1.5">
        {["Sheet", "WhatsApp", "Email"].map((src, row) => (
          <SceneReveal
            key={src}
            delay={row * 70}
            direction="left"
            distance={14}
            scaleFrom={0.992}
            className="flex items-center gap-3 rounded-[4px] border border-hairline bg-canvas px-3 py-2 text-xs"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mute-red/80" />
            <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-fog">
              {src}
            </span>
            <span className="min-w-0 flex-1 truncate text-cloud">Bayan Technologies</span>
            <span className="shrink-0 font-mono text-[10px] text-fog">re-entered</span>
          </SceneReveal>
        ))}
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="rounded-[4px] border border-hairline bg-canvas p-3 font-mono text-[11px]">
        <SceneReveal direction="left" distance={12} className="flex items-center justify-between">
          <span className="text-fog">subtotal</span>
          <span className="text-cloud">SAR 12,000</span>
        </SceneReveal>
        <SceneReveal
          delay={90}
          direction="right"
          distance={12}
          className="mt-2 flex items-center justify-between"
        >
          <span className="text-fog">vat 15%</span>
          <span className="inline-flex items-center gap-1.5 text-mute-red">
            <span className="h-1.5 w-1.5 rounded-full bg-mute-red" />
            SAR 1,800 ?
          </span>
        </SceneReveal>
        <SceneReveal
          delay={160}
          direction="left"
          distance={12}
          className="mt-2 flex items-center justify-between border-t border-hairline pt-2"
        >
          <span className="text-fog">total</span>
          <span className="text-bone">SAR 13,800</span>
        </SceneReveal>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <SceneReveal direction="left" distance={14} className="max-w-[82%] rounded-[4px] rounded-bl-none border border-hairline bg-canvas px-3 py-2 text-xs text-cloud">
        Did INV-1207 get paid?
      </SceneReveal>
      <SceneReveal delay={120} direction="right" distance={14} className="ml-auto max-w-[82%] rounded-[4px] rounded-br-none border border-mute-red/20 bg-ink px-3 py-2 text-xs text-fog">
        not sure — will check the sheet
        <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-mute-red align-middle" />
      </SceneReveal>
    </div>
  );
}

export function ProblemSection() {
  return (
    <section className="home-section border-b border-hairline bg-canvas/95 py-16 sm:py-20">
      <ScrollScene className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SceneReveal distance={28} scaleFrom={0.978}>
          <SectionHeader
            index="// 03"
            eyebrow="The operating problem"
            title="Invoice visibility gets lost across tools"
            lead="Customer records, VAT checks, invoice status, and payment tracking end up scattered across spreadsheets, WhatsApp, and memory."
          />
        </SceneReveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <SceneReveal
              key={p.title}
              delay={i * 90}
              direction={i === 0 ? "left" : i === 2 ? "right" : "up"}
              distance={34}
              rotate={i === 0 ? -1.2 : i === 2 ? 1.2 : 0}
              scaleFrom={0.965}
              className="home-card group flex h-full flex-col rounded-[4px] border border-hairline bg-ink p-5 transition hover:border-graphite"
            >
              <div className="flex items-center justify-between">
                <IconBox icon={p.icon} tone={PROBLEM_TONES[i]} well="bg-canvas" />
                <Chip tone="muted">{PROBLEM_CHIPS[i]}</Chip>
              </div>
              <h3 className="mt-5 font-display text-lg font-medium tracking-[0.025em] text-bone">
                {p.title}
              </h3>
              <div className="mt-4">
                <ProblemFragment index={i} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-fog">{p.description}</p>
              <div className="mt-auto pt-4 font-mono text-[11px] text-fog">
                {["customer.dupe", "vat.verify", "payment.state"][i]}{" "}
                <span className="text-mute-red">{["×3", "/ manual", "/ unknown"][i]}</span>
              </div>
            </SceneReveal>
          ))}
        </div>
      </ScrollScene>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 04 — Core workflow (connected pipeline)                     */
/* ------------------------------------------------------------------ */

const WORKFLOW_META = [
  { label: "customer.id", value: "CUS-117" },
  { label: "invoice", value: "INV-1207" },
  { label: "total", value: "SAR 13,800" },
  { label: "state", value: "Open" },
];

const HOME_WORKFLOW_COPY = [
  {
    title: "Capture the client once",
    description: "Client details stop bouncing between chats, sheets, and old invoices.",
  },
  {
    title: "Raise the invoice cleanly",
    description: "Service lines become a structured draft without re-entering the basics.",
  },
  {
    title: "Verify before sending",
    description: "Totals and VAT checks sit in the same workspace before anyone sends.",
  },
  {
    title: "Keep follow-up visible",
    description: "The team can see what is draft, open, or paid without asking around.",
  },
];

export function WorkflowSection() {
  return (
    <section id="how" className="home-section home-section-spotlight border-b border-hairline bg-ink/95 py-24 sm:py-36 lg:py-40">
      <ScrollScene className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SceneReveal direction="left" distance={34}>
          <SectionHeader
            index="// 04"
            eyebrow="The workflow"
            title="One accountable path instead of scattered follow-up"
            lead="The MVP keeps the handoff tight, so each invoice has a clear owner, next state, and payment trail."
            size="lg"
          />
        </SceneReveal>

        <div className="relative mt-12">
          {/* connector rail — visible through the gaps between panels */}
          <SceneLine className="absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-hairline via-signal/40 to-hairline lg:block" />
          <div className="grid gap-4 lg:grid-cols-4">
            {WORKFLOW.map((s, i) => {
              const meta = WORKFLOW_META[i];
              const copy = HOME_WORKFLOW_COPY[i] ?? s;
              const last = i === WORKFLOW.length - 1;
              return (
                <SceneReveal
                  key={s.title}
                  delay={i * 90}
                  direction="left"
                  distance={28 + i * 4}
                  scaleFrom={0.972}
                  className="home-card relative rounded-[4px] border border-hairline bg-canvas p-5 transition hover:border-graphite"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
                      STEP 0{i + 1}
                    </span>
                    <s.icon className="h-5 w-5 text-signal" />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-medium tracking-[0.025em] text-bone">
                    {copy.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fog">{copy.description}</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-3 font-mono text-[11px]">
                    <span className="text-fog">{meta.label}</span>
                    <span className="text-signal">{meta.value}</span>
                  </div>

                  {!last ? (
                    <>
                      {/* horizontal flow node (desktop) */}
                      <span className="absolute -right-[9px] top-1/2 z-10 hidden h-[18px] w-[18px] -translate-y-1/2 place-items-center rounded-full border border-hairline bg-ink text-signal lg:grid">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      {/* vertical flow node (mobile) */}
                      <span className="absolute -bottom-[9px] left-1/2 z-10 grid h-[18px] w-[18px] -translate-x-1/2 place-items-center rounded-full border border-hairline bg-ink text-signal lg:hidden">
                        <ArrowDown className="h-3 w-3" />
                      </span>
                    </>
                  ) : null}
                </SceneReveal>
              );
            })}
          </div>
        </div>

        <SceneReveal delay={120} direction="none" scaleFrom={0.965} className="mt-4">
          <div className="home-elevated-panel flex flex-col items-start justify-between gap-3 rounded-[4px] border border-signal/25 bg-canvas px-5 py-4 sm:flex-row sm:items-center">
            <div className="font-mono text-[11px] text-fog">
              customer.record <span className="text-graphite">→</span> invoice.build{" "}
              <span className="text-graphite">→</span> vat.check{" "}
              <span className="text-graphite">→</span> receivable.open
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-signal">
              <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
              receivable open · SAR 13,800
            </div>
          </div>
        </SceneReveal>
      </ScrollScene>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 05 — Built for (roadmap + segment list)                     */
/* ------------------------------------------------------------------ */

const SEGMENT_TONES = ["text-cloud", "text-cloud", "text-cloud", "text-cloud"];
const SEGMENT_TAGS = ["seg.consulting", "seg.service", "seg.logistics", "seg.gcc"];

export function BuiltForSection() {
  return (
    <section className="home-section border-b border-hairline bg-canvas/95 py-16 sm:py-24">
      <ScrollScene className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SceneReveal distance={24}>
          <SectionHeader
            index="// 05"
            eyebrow="Built for"
            title="Built first for service businesses that need invoice clarity"
            lead="Starting with service workflows, designed to expand into adjacent SME operations later."
          />
        </SceneReveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {/* roadmap panel */}
          <SceneReveal direction="left" distance={34} className="lg:col-span-1">
            <div className="home-card flex h-full flex-col rounded-[4px] border border-hairline bg-ink p-6">
              <Chip tone="signal">focus</Chip>
              <div className="relative mt-6 pl-1">
                <div
                  aria-hidden="true"
                  className="absolute left-[7px] top-5 h-7 w-px bg-hairline"
                />
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-signal bg-signal/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-bone">Service workflows</div>
                      <div className="mt-0.5 text-xs text-fog">Available in the MVP today</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-graphite bg-canvas">
                      <span className="h-1.5 w-1.5 rounded-full bg-graphite" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-cloud">Adjacent SME operations</div>
                      <div className="mt-0.5 text-xs text-fog">Planned after pilot validation</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-auto pt-6 font-mono text-[11px] text-fog">
                market.scope <span className="text-signal">/ expanding</span>
              </p>
            </div>
          </SceneReveal>

          {/* segment rows */}
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
            {BUILT_FOR.map((b, i) => (
              <SceneReveal
                key={b.label}
                delay={i * 70}
                direction={i % 2 === 0 ? "left" : "right"}
                distance={22}
                className="home-card group flex items-start gap-4 rounded-[4px] border border-hairline bg-ink p-5 transition hover:border-graphite"
              >
                <IconBox icon={b.icon} tone={SEGMENT_TONES[i]} well="bg-canvas" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display font-medium tracking-[0.025em] text-bone">{b.label}</h3>
                    <span className="shrink-0 font-mono text-[10px] text-fog">{SEGMENT_TAGS[i]}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-fog">{b.description}</p>
                </div>
              </SceneReveal>
            ))}
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 06 — MVP feature grid (bento)                               */
/* ------------------------------------------------------------------ */

const FEATURE_TONES = [
  "text-cloud",
  "text-cloud",
  "text-cloud",
  "text-cloud",
  "text-cloud",
  "text-cloud",
  "text-cloud",
];

function FeatureCell({
  index,
  span,
  chip,
}: {
  index: number;
  span: string;
  chip?: string;
}) {
  const f = MVP_FEATURES[index];
  return (
    <SceneReveal
      delay={index * 50}
      direction={index % 3 === 0 ? "left" : index % 3 === 2 ? "right" : "up"}
      distance={24}
      className={cn(
        "home-card group flex flex-col rounded-[4px] border border-hairline bg-canvas p-5 transition hover:border-graphite",
        span,
      )}
    >
      <div className="flex items-center justify-between">
        <IconBox icon={f.icon} tone={FEATURE_TONES[index]} well="bg-ink" />
        {chip ? <Chip tone="muted">{chip}</Chip> : null}
      </div>
      <h3 className="mt-4 font-display font-medium tracking-[0.025em] text-bone">{f.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fog">{f.description}</p>
    </SceneReveal>
  );
}

const PAY_STATES = ["Draft", "Sent", "Open", "Paid"];

export function FeatureGridSection() {
  const vat = MVP_FEATURES[3];
  const pay = MVP_FEATURES[4];
  return (
    <section className="home-section border-b border-hairline bg-ink/95 py-24 sm:py-32">
      <ScrollScene className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SceneReveal direction="none" scaleFrom={0.96}>
          <SectionHeader
            index="// 06"
            eyebrow="What's in the MVP"
            title="Practical controls for the MVP pilot"
            lead="A tight feature set for testing the workflow on real invoices, with enough structure to replace the spreadsheet loop."
            align="center"
          />
        </SceneReveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <FeatureCell index={0} span="lg:col-span-2" />
          <FeatureCell index={1} span="lg:col-span-2" />
          <FeatureCell index={2} span="lg:col-span-2" />

          {/* Featured — VAT-aware calculations */}
          <SceneReveal
            delay={150}
            direction="left"
            distance={32}
            scaleFrom={0.97}
            className="home-card group flex flex-col justify-between gap-5 rounded-[4px] border border-hairline bg-canvas p-5 transition hover:border-graphite sm:col-span-2 sm:flex-row sm:items-end lg:col-span-3"
          >
            <div>
              <IconBox icon={vat.icon} tone="text-signal" well="bg-ink" />
              <h3 className="mt-4 font-display font-medium tracking-[0.025em] text-bone">{vat.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-fog">{vat.description}</p>
            </div>
            <div className="w-full shrink-0 rounded-[4px] border border-hairline bg-ink p-3 sm:w-44">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-fog">subtotal</span>
                <span className="text-cloud">12,000</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
                <span className="text-fog">vat 15%</span>
                <span className="text-signal">1,800</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-hairline pt-2 font-mono text-[11px]">
                <span className="text-fog">total</span>
                <span className="text-signal">13,800</span>
              </div>
            </div>
          </SceneReveal>

          {/* Featured — Payment status tracking */}
          <SceneReveal
            delay={200}
            direction="right"
            distance={32}
            scaleFrom={0.97}
            className="home-card group flex flex-col justify-between gap-5 rounded-[4px] border border-hairline bg-canvas p-5 transition hover:border-graphite sm:col-span-2 sm:flex-row sm:items-end lg:col-span-3"
          >
            <div>
              <IconBox icon={pay.icon} tone="text-signal" well="bg-ink" />
              <h3 className="mt-4 font-display font-medium tracking-[0.025em] text-bone">{pay.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-fog">{pay.description}</p>
            </div>
            <div className="w-full shrink-0 sm:w-56">
              <div className="grid grid-cols-4 overflow-hidden rounded-[4px] border border-hairline">
                {PAY_STATES.map((state, idx) => (
                  <div
                    key={state}
                    className={cn(
                      "py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.04em]",
                      idx === 2
                        ? "bg-signal text-ink"
                        : idx < 2
                          ? "bg-ink text-signal/70"
                          : "bg-ink text-fog",
                    )}
                  >
                    {state}
                  </div>
                ))}
              </div>
              <div className="mt-2 font-mono text-[11px] text-fog">
                receivable <span className="text-signal">open</span>
              </div>
            </div>
          </SceneReveal>

          <FeatureCell index={5} span="lg:col-span-2" />
          <FeatureCell index={6} span="lg:col-span-2" chip="placeholder" />

          {/* Compliance note cell */}
          <SceneReveal
            delay={250}
            direction="none"
            scaleFrom={0.975}
            className="flex flex-col justify-center rounded-[4px] border border-dashed border-hairline bg-canvas/40 p-5 sm:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
              <ShieldCheck className="h-4 w-4 text-signal" />
              compliance note
            </div>
            <p className="mt-3 text-xs leading-relaxed text-fog">
              Placeholder provides a ZATCA-ready workflow foundation and VAT readiness checks — it does not
              claim official ZATCA compliance. A final compliance review is required before production use.
            </p>
          </SceneReveal>
        </div>
      </ScrollScene>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 08 — Pilot CTA (split commercial panel)                     */
/* ------------------------------------------------------------------ */

const PILOT_INCLUDES = [
  "Manual onboarding",
  "Direct feedback loop",
  "Customer records",
  "Invoice workflow",
  "VAT-aware totals",
  "Payment tracking",
];

export function PilotSection() {
  return (
    <section className="home-section border-b border-hairline bg-canvas/95 py-24 sm:py-36 lg:py-40">
      <ScrollScene className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SceneReveal direction="none" distance={0} scaleFrom={0.945}>
          <div className="home-pilot-panel overflow-hidden rounded-[4px] border border-signal/35">
            <div className="grid lg:grid-cols-2">
              {/* left — pitch */}
              <div className="aurora relative p-8 sm:p-10">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                    <span className="text-signal">{"// 08"}</span>
                    <span className="h-px w-8 bg-graphite" />
                    <span className="text-fog">Early access</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-medium leading-[1.12] tracking-[0.025em] text-bone sm:text-4xl">
                    Start with a guided pilot
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-fog">
                    Placeholder is in early pilot. Manual onboarding. Direct support. Feedback-based
                    improvements as you use it on real invoices.
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1.5 font-mono text-[11px] text-fog">
                    <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
                    pilot.access <span className="text-signal">open</span>
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
                  <Link href={PILOT_HREF} className={buttonStyles("primary", "lg", "w-full sm:w-auto")}>
                    Request pilot access <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/pricing" className={buttonStyles("secondary", "lg", "w-full sm:w-auto")}>
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SceneReveal>
      </ScrollScene>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 09 — FAQ (two-column)                                       */
/* ------------------------------------------------------------------ */

export function FaqSection() {
  return (
    <section id="faq" className="home-section border-b border-hairline bg-ink/95 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:px-8">
        <SceneReveal distance={16} className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="text-signal">{"// 09"}</span>
            <span className="h-px w-8 bg-graphite" />
            <span className="text-fog">FAQ</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-medium leading-[1.12] tracking-[0.025em] text-bone sm:text-4xl">
            Operational questions, answered
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-fog">
            Short answers on compliance, data, and how the early pilot works.
          </p>
          <a
            href={CONTACT_MAILTO}
            className="mt-6 inline-flex items-center gap-2 text-sm text-signal transition hover:text-bone"
          >
            Still have a question? Talk to us
            <ArrowRight className="h-4 w-4" />
          </a>
        </SceneReveal>
        <SceneReveal delay={120} distance={12} scaleFrom={0.994}>
          <Faq className="" />
        </SceneReveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 10 — Final CTA                                              */
/* ------------------------------------------------------------------ */

export function FinalCtaSection() {
  return (
    <section className="home-section bg-canvas/95 py-24 sm:py-32">
      <ScrollScene exit={false} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SceneReveal direction="none" distance={0} scaleFrom={0.93}>
          <div className="aurora home-final-panel relative overflow-hidden rounded-[4px] border border-graphite/70 px-6 py-12 sm:px-12 sm:py-16">
            <div className="relative z-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                  <span className="text-signal">{"// 10"}</span>
                  <span className="h-px w-8 bg-graphite" />
                  <span className="text-fog">Get started</span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-medium leading-[1.1] tracking-[0.025em] text-bone sm:text-4xl lg:text-5xl">
                  Pilot a cleaner invoice workflow before your team outgrows spreadsheets.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-fog">
                  Placeholder is an MVP for small teams ready to test customer records, VAT checks,
                  and payment follow-up in one place before committing to a heavier system.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link href={PILOT_HREF} className={buttonStyles("primary", "lg")}>
                  Request pilot access <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/features" className={buttonStyles("secondary", "lg")}>
                  View features
                </Link>
              </div>
            </div>
          </div>
        </SceneReveal>
      </ScrollScene>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust strip — honest credibility band (sits right under the hero).   */
/* No fake logos/metrics: pre-customer, so these are claims we can keep. */
/* ------------------------------------------------------------------ */

const TRUST_ITEMS: { icon: LucideIcon; label: string; sub: string }[] = [
  { icon: MapPin, label: "Built in Saudi Arabia", sub: "For KSA & GCC VAT workflows" },
  { icon: ShieldCheck, label: "VAT-ready foundation", sub: "Readiness checks, not certified ZATCA" },
  { icon: Lock, label: "Your data stays yours", sub: "Cookieless analytics · never sold" },
  { icon: Sparkles, label: "Pilot-stage, no lock-in", sub: "Manual onboarding · leave anytime" },
];

export function TrustStrip() {
  return (
    <section aria-label="What you can rely on" className="border-b border-hairline bg-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-4 lg:gap-x-0">
          {TRUST_ITEMS.map((t, i) => (
            <div
              key={t.label}
              className={cn(
                "flex items-start gap-3 py-5 lg:py-6 lg:px-6 lg:first:pl-0 lg:last:pr-0",
                i > 0 && "lg:border-l lg:border-hairline",
              )}
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[4px] border border-hairline bg-canvas text-signal">
                <t.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium leading-snug text-bone">{t.label}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-fog">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 07 — What a pilot looks like (the honest onboarding path)    */
/* ------------------------------------------------------------------ */

const PILOT_STEP_TAGS = ["request", "review", "onboard", "build"];

export function PilotJourneySection() {
  return (
    <section className="home-section border-b border-hairline bg-ink/95 py-16 sm:py-24">
      <ScrollScene className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SceneReveal distance={24}>
          <SectionHeader
            index="// 07"
            eyebrow="The pilot"
            title="What a pilot actually looks like"
            lead="No long sales cycle and no contracts. Onboarding is manual and hands-on — and you can walk away at any point."
          />
        </SceneReveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {PILOT_NEXT_STEPS.map((step, i) => (
            <SceneReveal
              key={step}
              delay={i * 90}
              direction="up"
              distance={26}
              scaleFrom={0.97}
              className="home-card flex flex-col rounded-[4px] border border-hairline bg-canvas p-5 transition hover:border-graphite"
            >
              <div className="flex items-center justify-between">
                <span className="nums-tabular grid h-9 w-9 place-items-center rounded-full border border-signal/30 bg-signal/10 font-mono text-sm text-signal">
                  {i + 1}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-fog">
                  {PILOT_STEP_TAGS[i]}
                </span>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-cloud">{step}</p>
            </SceneReveal>
          ))}
        </div>

        <SceneReveal delay={140} direction="none" scaleFrom={0.965} className="mt-4">
          <div className="home-elevated-panel flex flex-col items-start justify-between gap-3 rounded-[4px] border border-signal/25 bg-canvas px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5 text-sm text-cloud">
              <Unlock className="h-4 w-4 shrink-0 text-signal" />
              No lock-in, no auto-charges, and no account is created without you.
            </div>
            <div className="font-mono text-[11px] text-fog">
              pilot.exit <span className="text-signal">anytime</span>
            </div>
          </div>
        </SceneReveal>
      </ScrollScene>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee ticker strip — between sections as a rhythm break           */
/* ------------------------------------------------------------------ */

const MARQUEE_ITEMS = [
  "VAT-aware totals",
  "Customer records",
  "15% KSA VAT",
  "Payment tracking",
  "Net 14 terms",
  "Readiness checks",
  "Reusable records",
  "Invoice workflow",
  "Draft · Sent · Open · Paid",
  "ZATCA-ready foundation",
  "Receivables overview",
  "SAR invoicing",
] as const;

export function MarqueeStrip() {
  // Two identical sets side by side so translating -50% loops seamlessly.
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div
      aria-hidden="true"
      className="marquee-viewport relative overflow-hidden border-y border-hairline bg-ink py-3.5 select-none"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max items-center gap-0">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex shrink-0 items-center gap-2.5 px-5 font-mono text-[11px] uppercase tracking-[0.1em] text-fog"
          >
            <span className="h-1 w-1 shrink-0 rounded-full bg-signal/60" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
