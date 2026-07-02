"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  CircleDollarSign,
  Clock3,
  FileText,
  ListChecks,
  Radio,
  SaudiRiyal,
  ShieldCheck,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * ProductWorkspaceShowcase
 * ------------------------------------------------------------------
 * Section // 02 — replaces the old "Workflow Trace" scroll story.
 *
 * Shows Placeholder as a connected operating workspace for receivables
 * rather than a static invoice generator: a large central dashboard mockup
 * surrounded by floating panels (customer record, VAT readiness, receivable
 * status, invoice log, payment timeline, pilot/compliance note).
 *
 *  Desktop : 3-column "command center" — floating panels flank a large,
 *            readable central mockup; subtle rotation + lift sell the float.
 *  Mobile  : single column — central mockup first, then panels as plain cards.
 *
 * Motion language (cinematic, but readability-first):
 *  - The scene *assembles* once as it scrolls into view: the central dashboard
 *    anchors first, then the satellite panels settle in around it (staggered
 *    entrance, one-shot via `whileInView` — no continuous scroll scrubbing).
 *  - Panels rest at a readable secondary opacity (0.8–0.92 by depth), never
 *    fading out — depth is conveyed by luminance + scale + tilt, not hiding.
 *  - A single, cheap scroll-linked background "glow" drifts behind the stage
 *    (camera-like movement) — one element, a couple of transforms.
 *  - prefers-reduced-motion and mobile fall back to static, full-opacity cards.
 */

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

type InvoiceState = "Draft" | "Sent" | "Open" | "Paid" | "Overdue";

const STATUS_STYLES: Record<InvoiceState, string> = {
  Draft: "border-hairline bg-ink text-fog",
  Sent: "border-graphite/70 bg-ink text-cloud",
  Open: "border-signal/30 bg-signal/10 text-signal",
  Paid: "border-signal/25 bg-signal/[0.07] text-signal",
  Overdue: "border-mute-red/30 bg-mute-red/10 text-mute-red",
};

function StatusPill({ state }: { state: InvoiceState }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
        STATUS_STYLES[state],
      )}
    >
      {state}
    </span>
  );
}

function Tag({ icon: Icon, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
      {Icon ? <Icon className="h-3.5 w-3.5 text-signal" /> : null}
      {children}
    </div>
  );
}

/** Floating satellite card — plain stacked card on mobile, tilted/lifted on desktop. */
function FloatingPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "home-card rounded-[4px] border border-hairline bg-ink/95 p-4 transition duration-300 hover:border-graphite",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Central dashboard mockup                                            */
/* ------------------------------------------------------------------ */

// Count-up hook — animates from 0 to target (easeOutCubic) when `active`
// flips true. Snaps to target immediately when reduced motion is on.
function useCountUp(target: number, duration: number, active: boolean, reduced: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || reduced) { setValue(target); return; }
    setValue(0);
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reduced]);
  return value;
}

const STAT_TILES: {
  label: string;
  countTarget: number;
  formatValue: (n: number) => string;
  sub: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  { label: "Open invoices", countTarget: 7,  formatValue: (n) => String(n),  sub: "in progress",  icon: FileText,       tone: "text-signal" },
  { label: "VAT-ready",     countTarget: 12, formatValue: (n) => String(n),  sub: "checks passed", icon: ShieldCheck,    tone: "text-signal" },
  { label: "Paid · 30d",   countTarget: 38, formatValue: (n) => `SAR ${n}k`, sub: "collected",    icon: CircleDollarSign, tone: "text-cloud" },
];

const PAYMENT_DISTRIBUTION: { state: InvoiceState; count: number; bar: string }[] = [
  { state: "Draft", count: 2, bar: "bg-graphite" },
  { state: "Sent", count: 3, bar: "bg-fog/70" },
  { state: "Open", count: 7, bar: "bg-signal" },
  { state: "Paid", count: 14, bar: "bg-signal/55" },
];

const RECENT_INVOICES: { id: string; customer: string; amount: string; state: InvoiceState }[] = [
  { id: "INV-1207", customer: "Bayan Technologies", amount: "SAR 13,800", state: "Open" },
  { id: "INV-1206", customer: "Najd Logistics", amount: "SAR 8,200", state: "Sent" },
  { id: "INV-1205", customer: "Areeb Studio", amount: "SAR 5,400", state: "Paid" },
  { id: "INV-1204", customer: "Mawten Co.", amount: "SAR 21,000", state: "Overdue" },
];

// Gentle upward receivables trend — static SVG, scales with the card.
const SPARK_POINTS = "8,64 52,56 96,60 140,42 184,48 228,32 272,36 312,18";
const SPARK_AREA = `M8,64 L52,56 L96,60 L140,42 L184,48 L228,32 L272,36 L312,18 L312,90 L8,90 Z`;

function CentralMockup() {
  const total = PAYMENT_DISTRIBUTION.reduce((sum, slice) => sum + slice.count, 0);
  const reduced = Boolean(useReducedMotion());
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  // One hook call per stat — hooks cannot be called inside .map().
  const totalCount  = useCountUp(86400, 1800, inView, reduced);
  const statCount0  = useCountUp(STAT_TILES[0].countTarget, 1200, inView, reduced);
  const statCount1  = useCountUp(STAT_TILES[1].countTarget, 1400, inView, reduced);
  const statCount2  = useCountUp(STAT_TILES[2].countTarget, 1600, inView, reduced);
  const statCounts  = [statCount0, statCount1, statCount2];

  return (
    <div ref={ref} className="relative min-w-0">
      <div
        aria-hidden="true"
        className="absolute -inset-2 rounded-[8px] border border-signal/10 bg-signal/[0.025]"
      />

      <div className="home-showcase-frame relative min-w-0 overflow-hidden rounded-[4px] border border-graphite/70 bg-canvas">
        {/* faint workstation grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-faint opacity-60 [background-size:22px_22px]"
          style={{ maskImage: "linear-gradient(to bottom, black, transparent 88%)" }}
        />

        {/* header */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] border border-signal/25 bg-signal/10 text-signal">
              <Radio className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-xs text-cloud">workspace://receivables/overview</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-fog">Operating view</div>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-signal">
            <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal" />
            Demo data
          </span>
        </div>

        <div className="relative z-10 p-4">
          {/* total receivables */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
                <SaudiRiyal className="h-3.5 w-3.5 text-signal" />
                Total receivables
              </div>
              <div className="mt-2 font-display text-3xl font-semibold tracking-[0.02em] text-bone sm:text-4xl">
                SAR {totalCount.toLocaleString("en-US")}
              </div>
            </div>
            <div className="shrink-0 rounded-full border border-signal/25 bg-signal/10 px-2.5 py-1 font-mono text-[11px] text-signal">
              ↑ 12.4%
            </div>
          </div>

          {/* stat tiles */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {STAT_TILES.map((tile, i) => (
              <div key={tile.label} className="rounded-[4px] border border-hairline bg-ink p-3">
                <tile.icon className={cn("h-4 w-4", tile.tone)} />
                <div className="mt-2 truncate font-mono text-sm font-semibold text-bone sm:text-base">
                  {tile.formatValue(statCounts[i])}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-fog">{tile.label}</div>
              </div>
            ))}
          </div>

          {/* payment status overview */}
          <div className="mt-4 rounded-[4px] border border-hairline bg-ink p-4">
            <div className="flex items-center justify-between">
              <Tag icon={Wallet}>Payment status</Tag>
              <span className="font-mono text-[11px] text-fog">{total} invoices</span>
            </div>
            <div className="mt-3 flex h-2.5 gap-1 overflow-hidden rounded-full">
              {PAYMENT_DISTRIBUTION.map((slice) => (
                <span
                  key={slice.state}
                  className={cn("min-w-[6px] rounded-[2px]", slice.bar)}
                  style={{ flexGrow: slice.count }}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] text-fog">
              {PAYMENT_DISTRIBUTION.map((slice) => (
                <span key={slice.state} className="inline-flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", slice.bar)} />
                  {slice.state}
                  <span className="text-cloud">{slice.count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* activity chart */}
          <div className="mt-4 hidden rounded-[4px] border border-hairline bg-ink p-4 2xl:block">
            <div className="flex items-center justify-between">
              <Tag>Receivables activity</Tag>
              <span className="font-mono text-[11px] text-fog">6 mo</span>
            </div>
            <svg
              aria-hidden="true"
              className="mt-3 h-16 w-full"
              viewBox="0 0 320 90"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(168, 255, 83)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="rgb(168, 255, 83)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={SPARK_AREA} fill="url(#spark-fill)" />
              <polyline
                points={SPARK_POINTS}
                fill="none"
                stroke="rgb(168, 255, 83)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="312" cy="18" r="3.5" fill="rgb(168, 255, 83)" />
            </svg>
          </div>

          {/* recent invoices */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <Tag icon={FileText}>Recent invoices</Tag>
              <span className="font-mono text-[11px] text-fog">last 4</span>
            </div>
            <div className="mt-3 overflow-hidden rounded-[4px] border border-hairline">
              {RECENT_INVOICES.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 bg-ink px-3 py-2.5",
                    index > 0 && "border-t border-hairline",
                  )}
                >
                  <span className="font-mono text-[11px] text-fog">{invoice.id}</span>
                  <span className="min-w-0 truncate text-sm text-cloud">{invoice.customer}</span>
                  <span className="flex items-center gap-3">
                    <span className="hidden font-mono text-[11px] text-bone sm:inline">{invoice.amount}</span>
                    <StatusPill state={invoice.state} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* cinematic overlap chips (large screens only) */}
      <span className="absolute -right-3 -top-3 z-20 hidden items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1.5 font-mono text-[11px] text-fog xl:inline-flex">
        <ShieldCheck className="h-3.5 w-3.5 text-signal" />
        12 VAT-ready
      </span>
      <span className="absolute -bottom-3 -left-3 z-20 hidden items-center gap-2 rounded-full border border-signal/25 bg-ink px-3 py-1.5 font-mono text-[11px] text-fog xl:inline-flex">
        <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal" />
        receivable open · SAR 13,800
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating satellite panels                                           */
/* ------------------------------------------------------------------ */

function CustomerRecordPanel() {
  return (
    <FloatingPanel delay={60} className="lg:-rotate-[0.7deg]">
      <Tag icon={UserRound}>customer.record</Tag>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border border-hairline bg-canvas text-signal">
          <UserRound className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-bone">Bayan Technologies LLC</div>
          <div className="truncate font-mono text-[11px] text-fog">customer.id CUS-117</div>
        </div>
      </div>
      <div className="mt-3 grid gap-1.5 font-mono text-[11px]">
        <div className="flex justify-between gap-3">
          <span className="text-fog">vat_number</span>
          <span className="truncate text-cloud">300458921700003</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-fog">terms</span>
          <span className="text-cloud">Net 14 · SAR</span>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-fog">Reused on every future invoice.</p>
    </FloatingPanel>
  );
}

const VAT_CHECKS = ["Seller VAT present", "Customer VAT validated", "Line items + totals matched"];

function VatReadinessPanel() {
  return (
    <FloatingPanel delay={120} className="lg:rotate-[0.6deg]">
      <Tag icon={ListChecks}>vat.readiness</Tag>
      <div className="mt-3 space-y-2">
        {VAT_CHECKS.map((check) => (
          <div key={check} className="flex items-center gap-2.5">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-signal/30 bg-signal/10 text-signal">
              <Check className="h-3 w-3" />
            </span>
            <span className="text-[13px] text-cloud">{check}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 border-t border-hairline pt-3 text-[11px] leading-relaxed text-fog">
        VAT-ready workflow foundation. Manual compliance review required before production use.
      </p>
    </FloatingPanel>
  );
}

const INVOICE_LOG = [
  { tone: "text-cloud", value: "invoice.build: INV-1207" },
  { tone: "text-signal", value: "vat.check: pass" },
  { tone: "text-signal", value: "receivable.open: SAR 13,800" },
];

function InvoiceLogPanel() {
  return (
    <FloatingPanel delay={180} className="lg:-rotate-[0.5deg]">
      <Tag icon={FileText}>invoice.log</Tag>
      <div className="mt-3 grid gap-1.5 font-mono text-[11px] leading-relaxed">
        {INVOICE_LOG.map((line) => (
          <div key={line.value} className={cn("flex items-center gap-2", line.tone)}>
            <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
            <span className="truncate">{line.value}</span>
          </div>
        ))}
      </div>
    </FloatingPanel>
  );
}

function ReceivableStatusPanel() {
  return (
    <FloatingPanel delay={60} className="lg:rotate-[0.7deg]">
      <div className="flex items-center justify-between">
        <Tag icon={CircleDollarSign}>receivable.status</Tag>
        <StatusPill state="Open" />
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tracking-[0.02em] text-bone">SAR 13,800</div>
      <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-fog">
        <Clock3 className="h-3.5 w-3.5 text-signal" />
        Due in 14 days · Net 14
      </div>
    </FloatingPanel>
  );
}

const TIMELINE = ["Draft", "Sent", "Open", "Paid"] as const;
const TIMELINE_ACTIVE = 2; // Open

function PaymentTimelinePanel() {
  return (
    <FloatingPanel delay={120} className="lg:-rotate-[0.6deg]">
      <Tag icon={Wallet}>payment.timeline</Tag>
      <div className="mt-4 flex items-center">
        {TIMELINE.map((step, index) => {
          const done = index <= TIMELINE_ACTIVE;
          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <span
                className={cn(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                  index === TIMELINE_ACTIVE
                    ? "border-signal bg-signal"
                    : done
                      ? "border-signal/60 bg-signal/30"
                      : "border-graphite bg-canvas",
                )}
              >
                {index === TIMELINE_ACTIVE ? <span className="h-1.5 w-1.5 rounded-full bg-ink" /> : null}
              </span>
              {index < TIMELINE.length - 1 ? (
                <span className={cn("h-px flex-1", index < TIMELINE_ACTIVE ? "bg-signal/60" : "bg-hairline")} />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em]">
        {TIMELINE.map((step, index) => (
          <span key={step} className={index === TIMELINE_ACTIVE ? "text-signal" : "text-fog"}>
            {step}
          </span>
        ))}
      </div>
      <p className="mt-3 border-t border-hairline pt-3 text-[11px] leading-relaxed text-fog">
        Invoice/payment status tracking — not payment processing.
      </p>
    </FloatingPanel>
  );
}

function PilotNotePanel() {
  return (
    <FloatingPanel delay={180} className="border-dashed bg-canvas/40 lg:rotate-[0.5deg]">
      <Tag icon={ShieldCheck}>pilot.support</Tag>
      <p className="mt-3 text-[12px] leading-relaxed text-fog">
        Manual compliance review required before production use. Pilot teams get hands-on onboarding and a
        direct feedback loop.
      </p>
    </FloatingPanel>
  );
}

function useDesktopScene() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return desktop;
}

/**
 * One-shot entrance layer. The scene assembles as it scrolls into view and then
 * *stays put* at a readable resting opacity — no scroll scrubbing, no exit fade.
 * Depth is communicated by `rest` (resting opacity 0.8–1) + a small entrance
 * offset/tilt. Mobile and reduced-motion render a plain, fully opaque card.
 */
function StageLayer({
  central = false,
  children,
  className,
  desktop,
  reduced,
  rest = 1,
  delay = 0,
  side = 0,
  rotate = 0,
}: {
  central?: boolean;
  children: ReactNode;
  className?: string;
  desktop: boolean;
  reduced: boolean;
  rest?: number;
  delay?: number;
  side?: -1 | 0 | 1;
  rotate?: number;
}) {
  if (reduced || !desktop) {
    return <div className={cn("min-w-0", className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("min-w-0", className)}
      initial={{
        opacity: 0,
        x: side * 24,
        y: 22,
        scale: central ? 0.94 : 0.97,
        rotate,
      }}
      whileInView={{ opacity: rest, x: 0, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Hairline that draws itself in once, linking the central mockup to the panels. */
function ConnectorLine({
  className,
  desktop,
  origin,
  reduced,
}: {
  className: string;
  desktop: boolean;
  origin: "left" | "right";
  reduced: boolean;
}) {
  if (reduced || !desktop) {
    return <span aria-hidden="true" className={className} />;
  }

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      style={{ transformOrigin: `${origin} center` }}
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

function WorkspaceStage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = Boolean(useReducedMotion());
  const desktop = useDesktopScene();

  // Single, cheap scroll driver — only the decorative background glow tracks
  // scroll (camera-like drift). It never reaches 0, so it reads as ambient
  // depth, and it never touches the foreground panels' readability.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const meshOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.28, 0.62, 0.4]);
  const meshScale = useTransform(scrollYProgress, [0, 1], [0.94, 1.08]);
  const meshY = useTransform(scrollYProgress, [0, 1], [44, -44]);

  const animate = !reduced && desktop;

  return (
    <div ref={ref} className="relative mt-16 min-w-0 lg:mt-12">
      <div className="grid min-w-0 items-center gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.52fr)_minmax(0,0.82fr)] lg:gap-6">
        <motion.div
          aria-hidden="true"
          className="workspace-stage-mesh"
          style={
            animate ? { opacity: meshOpacity, scale: meshScale, y: meshY } : undefined
          }
        />

        <div className="relative z-10 order-2 flex min-w-0 flex-col gap-4 lg:order-1">
        <StageLayer
          desktop={desktop}
          reduced={reduced}
          rest={0.92}
          delay={0.15}
          rotate={-2}
          side={-1}
        >
          <CustomerRecordPanel />
        </StageLayer>
        <StageLayer
          desktop={desktop}
          reduced={reduced}
          rest={0.86}
          delay={0.25}
          rotate={1.5}
          side={-1}
        >
          <VatReadinessPanel />
        </StageLayer>
        <StageLayer
          desktop={desktop}
          reduced={reduced}
          rest={0.8}
          delay={0.35}
          rotate={-1}
          side={-1}
        >
          <InvoiceLogPanel />
        </StageLayer>
        </div>

        <StageLayer
          central
          className="relative z-20 order-1 lg:order-2"
          desktop={desktop}
          reduced={reduced}
          rest={1}
          delay={0}
        >
          <div className="relative min-w-0">
          <ConnectorLine
            className="pointer-events-none absolute left-[-1.5rem] top-[24%] hidden h-px w-6 bg-gradient-to-l from-signal/45 to-transparent lg:block"
            desktop={desktop}
            reduced={reduced}
            origin="right"
          />
          <ConnectorLine
            className="pointer-events-none absolute bottom-[24%] left-[-1.5rem] hidden h-px w-6 bg-gradient-to-l from-signal/45 to-transparent lg:block"
            desktop={desktop}
            reduced={reduced}
            origin="right"
          />
          <ConnectorLine
            className="pointer-events-none absolute right-[-1.5rem] top-[24%] hidden h-px w-6 bg-gradient-to-r from-signal/45 to-transparent lg:block"
            desktop={desktop}
            reduced={reduced}
            origin="left"
          />
          <ConnectorLine
            className="pointer-events-none absolute bottom-[24%] right-[-1.5rem] hidden h-px w-6 bg-gradient-to-r from-signal/45 to-transparent lg:block"
            desktop={desktop}
            reduced={reduced}
            origin="left"
          />
            <CentralMockup />
          </div>
        </StageLayer>

        <div className="relative z-10 order-3 flex min-w-0 flex-col gap-4">
        <StageLayer
          desktop={desktop}
          reduced={reduced}
          rest={0.92}
          delay={0.2}
          rotate={2}
          side={1}
        >
          <ReceivableStatusPanel />
        </StageLayer>
        <StageLayer
          desktop={desktop}
          reduced={reduced}
          rest={0.86}
          delay={0.3}
          rotate={-1.5}
          side={1}
        >
          <PaymentTimelinePanel />
        </StageLayer>
        <StageLayer
          desktop={desktop}
          reduced={reduced}
          rest={0.8}
          delay={0.4}
          rotate={1}
          side={1}
        >
          <PilotNotePanel />
        </StageLayer>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function ProductWorkspaceShowcase() {
  return (
    <section className="home-section home-section-spotlight relative overflow-hidden border-b border-hairline bg-ink/95 py-24 sm:py-32 lg:pb-24 lg:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/30 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="text-signal">{"// 02"}</span>
            <span className="h-px w-8 bg-graphite" />
            <span className="text-fog">The workspace</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-medium leading-[1.12] tracking-[0.025em] text-bone sm:text-4xl">
            Everything around the invoice, visible in one workspace.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-fog sm:text-base">
            Customer records, invoice status, VAT readiness, and receivable tracking stay connected instead
            of scattered across chats and spreadsheets.
          </p>
        </div>

        <WorkspaceStage />
      </div>
    </section>
  );
}
