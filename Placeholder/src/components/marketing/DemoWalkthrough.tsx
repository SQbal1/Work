"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  Lock,
  Play,
  Radio,
  RotateCcw,
  SaudiRiyal,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { GhostCursor, StaticHint } from "@/components/marketing/GhostCursor";
import { computeTotals } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { track, AnalyticsEvent } from "@/lib/analytics";

/**
 * DemoWalkthrough
 * ------------------------------------------------------------------
 * A public, front-end-only guided product tutorial for /demo.
 *
 * Idle: a normal 4-step stepper (Customer → Invoice → VAT readiness →
 * Payment) on demo data — fully browsable without starting the tour.
 *
 * Tutorial mode (triggered by "Start walkthrough"): the page dims behind
 * an overlay, the active demo panel is spotlighted (raised above the dim
 * + stronger lime border/glow), and a side/below instruction card guides
 * the user. Each step first *demonstrates* the action automatically, then
 * requires the user to perform it (Save customer, Add line item, Run VAT
 * check, set payment status) before "Next" unlocks. Escape or the Exit
 * button leaves tutorial mode.
 *
 * Everything is local React state on demo data. No persistence, no auth,
 * no real invoice creation. Honest wording is preserved (VAT readiness
 * foundation, not certified ZATCA compliance; status tracking, not
 * payment processing).
 */

/* ------------------------------------------------------------------ */
/* Demo data — kept internally consistent via the real calc helper     */
/* ------------------------------------------------------------------ */

const CUSTOMER = {
  name: "Bayan Technologies LLC",
  id: "CUS-117",
  vatNumber: "300458921700003",
  contact: "ahmad@bayan.sa",
  phone: "+966 50 123 4567",
  terms: "Net 14 · SAR",
  address: "King Fahd Road, Riyadh 12345, Saudi Arabia",
} as const;

const SELLER_VAT = "310122393500003";
const INVOICE_ID = "INV-1208";
const ISSUE_DATE = "17 Jun 2026";
const DUE_DATE = "01 Jul 2026";

const INVOICE_ITEMS = [
  { description: "Monthly advisory retainer", quantity: 1, unitPrice: 12000, vatRate: 0.15 },
  { description: "Onboarding workshop", quantity: 2, unitPrice: 1500, vatRate: 0.15 },
];

function sar(n: number): string {
  return `SAR ${n.toLocaleString("en-US")}`;
}

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

type Phase = "demo" | "action" | "done";

interface StepView {
  tutorial: boolean;
  tick: number;
  phase: Phase;
  done: boolean;
  reduced: boolean;
  onAction: () => void;
}

function PanelTag({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
      {Icon ? <Icon className="h-3.5 w-3.5 text-signal" /> : null}
      {children}
    </div>
  );
}

function KeyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-fog">{label}</span>
      <span className="min-w-0 truncate text-right text-cloud">{value}</span>
    </div>
  );
}

/** Prominent in-panel action button, used by the Customer + Invoice steps. */
function PanelAction({
  label,
  doneLabel,
  phase,
  done,
  onAction,
}: {
  label: string;
  doneLabel: string;
  phase: Phase;
  done: boolean;
  onAction: () => void;
}) {
  if (done) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-signal/30 bg-signal/[0.07] px-3 py-2.5 font-mono text-[11px] text-signal">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {doneLabel}
      </div>
    );
  }
  const actionable = phase === "action";
  return (
    <button
      type="button"
      data-demo-target
      onClick={onAction}
      disabled={!actionable}
      className={cn(
        buttonStyles("primary", "sm", "mt-4 w-full"),
        actionable ? "cue-ring" : "opacity-55",
      )}
    >
      {actionable ? <Play className="h-4 w-4" /> : null}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — Customer record                                            */
/* ------------------------------------------------------------------ */

const CUSTOMER_ROWS: { label: string; value: string }[] = [
  { label: "vat_number", value: CUSTOMER.vatNumber },
  { label: "contact", value: CUSTOMER.contact },
  { label: "phone", value: CUSTOMER.phone },
  { label: "terms", value: CUSTOMER.terms },
  { label: "address", value: CUSTOMER.address },
];

function CustomerPanel({ tutorial, tick, phase, done, onAction }: StepView) {
  const fullReveal = !tutorial || done;
  const shown = fullReveal ? CUSTOMER_ROWS.length : tick;
  const saved = !tutorial || done;

  return (
    <div className="rounded-[10px] border border-hairline bg-canvas p-5">
      <PanelTag icon={UserRound}>customer.record</PanelTag>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-hairline bg-ink text-signal">
          <UserRound className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-bone">{CUSTOMER.name}</div>
          <div className="font-mono text-[11px] text-fog">
            {saved ? `customer.id · ${CUSTOMER.id}` : "unsaved draft"}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 rounded-[10px] border border-hairline bg-ink p-3 font-mono text-[11px]">
        {CUSTOMER_ROWS.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "transition-opacity duration-300",
              i < shown ? "opacity-100" : "opacity-0",
            )}
          >
            <KeyRow label={row.label} value={row.value} />
          </div>
        ))}
      </div>

      {tutorial && !done ? (
        <PanelAction
          label="Save customer"
          doneLabel=""
          phase={phase}
          done={false}
          onAction={onAction}
        />
      ) : null}

      {saved ? (
        <div className="mt-3 flex items-start gap-2 border-t border-hairline pt-3 font-mono text-[11px] leading-relaxed text-fog">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
          Saved once. Reused on every future invoice, no re-entry.
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Invoice builder                                            */
/* ------------------------------------------------------------------ */

function InvoicePanel({ tutorial, tick, phase, done, onAction }: StepView) {
  const showBoth = !tutorial || done;
  const lines = showBoth ? INVOICE_ITEMS : tick >= 1 ? [INVOICE_ITEMS[0]] : [];
  const totals = computeTotals(lines, 0);
  const hasLines = lines.length > 0;

  return (
    <div className="rounded-[10px] border border-hairline bg-canvas p-5">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <PanelTag icon={FileText}>invoice.build</PanelTag>
        <span className="font-mono text-[11px] text-fog">
          {INVOICE_ID}
          {showBoth ? <span className="text-signal"> · generated</span> : null}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <span className="text-fog">
          customer: <span className="text-cloud">{CUSTOMER.name} · {CUSTOMER.id}</span>
        </span>
        <span className="text-fog">issued {ISSUE_DATE}</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-[10px] border border-hairline bg-ink">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[0.06em] text-fog">
          <span>Description</span>
          <span className="text-right">Amount</span>
        </div>
        {hasLines ? (
          lines.map((line) => (
            <div
              key={line.description}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-xs text-cloud">{line.description}</div>
                <div className="font-mono text-[10px] text-fog">
                  {line.quantity} × {sar(line.unitPrice)} · VAT 15%
                </div>
              </div>
              <span className="shrink-0 font-mono text-xs text-bone">
                {sar(line.quantity * line.unitPrice)}
              </span>
            </div>
          ))
        ) : (
          <div className="px-3 py-3 font-mono text-[11px] text-fog">Attaching customer…</div>
        )}
      </div>

      <div className="mt-3 space-y-1.5 rounded-[10px] border border-hairline bg-ink p-3 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-fog">subtotal</span>
          <span className="text-cloud">{hasLines ? sar(totals.subtotal) : "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-fog">vat 15%</span>
          <span className="text-signal">{hasLines ? sar(totals.vatTotal) : "—"}</span>
        </div>
        <div className="flex items-center justify-between border-t border-hairline pt-1.5 text-[13px]">
          <span className="text-fog">total</span>
          <span className="font-semibold text-bone">{hasLines ? sar(totals.total) : "—"}</span>
        </div>
      </div>

      {tutorial && !done ? (
        <PanelAction
          label="Add line item"
          doneLabel=""
          phase={phase}
          done={false}
          onAction={onAction}
        />
      ) : null}
      {tutorial && done ? (
        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-signal/30 bg-signal/[0.07] px-3 py-2.5 font-mono text-[11px] text-signal">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Invoice generated · {sar(totals.total)}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — VAT readiness                                              */
/* ------------------------------------------------------------------ */

const VAT_CHECKS: { label: string; value: string }[] = [
  { label: "Seller VAT number present", value: SELLER_VAT },
  { label: "Customer VAT number validated", value: CUSTOMER.vatNumber },
  { label: "Line items and totals matched", value: `${sar(15000)} + ${sar(2250)}` },
  { label: "Payment terms set", value: CUSTOMER.terms },
];

function VatReadinessPanel({ tutorial, phase, done, reduced, onAction }: StepView) {
  const [lit, setLit] = useState(!tutorial || done ? VAT_CHECKS.length : 0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!tutorial || done) setLit(VAT_CHECKS.length);
  }, [tutorial, done]);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const run = () => {
    if (running || done) return;
    if (reduced) {
      setLit(VAT_CHECKS.length);
      onAction();
      return;
    }
    setRunning(true);
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 1;
      setLit(n);
      if (n >= VAT_CHECKS.length) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        setRunning(false);
        onAction();
      }
    }, 360);
  };

  const allReady = lit >= VAT_CHECKS.length;
  const actionable = tutorial && !done && phase === "action" && !running;

  return (
    <div className="rounded-[10px] border border-hairline bg-canvas p-5">
      <div className="flex items-center justify-between">
        <PanelTag icon={ListChecks}>vat.readiness</PanelTag>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
            allReady
              ? "border-signal/30 bg-signal/10 text-signal"
              : "border-hairline bg-ink text-fog",
          )}
        >
          {allReady ? <Check className="h-3 w-3" /> : null}
          {lit} / {VAT_CHECKS.length} ready
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {VAT_CHECKS.map((check, i) => {
          const on = i < lit;
          return (
            <div
              key={check.label}
              className={cn(
                "flex items-start gap-2.5 rounded-[10px] border bg-ink p-3 transition-colors duration-300",
                on ? "border-hairline" : "border-hairline/60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                  on
                    ? "border-signal/30 bg-signal/10 text-signal"
                    : "border-hairline bg-canvas text-fog",
                )}
              >
                {on ? <Check className="h-3 w-3" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className={cn("text-[13px]", on ? "text-cloud" : "text-fog")}>
                  {check.label}
                </div>
                <div className="truncate font-mono text-[11px] text-fog">
                  {on ? check.value : "pending"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tutorial && !done ? (
        <button
          type="button"
          data-demo-target
          onClick={run}
          disabled={!actionable}
          className={cn(
            buttonStyles("primary", "sm", "mt-4 w-full"),
            actionable ? "cue-ring" : "opacity-55",
          )}
        >
          {running ? (
            "Running checks…"
          ) : (
            <>
              <Play className="h-4 w-4" /> Run VAT readiness check
            </>
          )}
        </button>
      ) : null}

      <p className="mt-4 flex items-start gap-2 border-t border-hairline pt-3 text-[11px] leading-relaxed text-fog">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
        VAT readiness foundation, not certified ZATCA compliance. A final compliance review is
        required before production use.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Payment status tracking                                    */
/* ------------------------------------------------------------------ */

type PaymentState = "Draft" | "Sent" | "Open" | "Paid";

const PAYMENT_STATES: { key: PaymentState; receivable: string }[] = [
  { key: "Draft", receivable: "Not a receivable yet · drafted" },
  { key: "Sent", receivable: `Sent to customer · issued ${ISSUE_DATE}` },
  { key: "Open", receivable: `Open receivable · due ${DUE_DATE} · Net 14` },
  { key: "Paid", receivable: `Settled · ${sar(17250)} paid` },
];

const STATUS_PILL: Record<PaymentState, string> = {
  Draft: "border-hairline bg-ink text-fog",
  Sent: "border-graphite/70 bg-ink text-cloud",
  Open: "border-signal/30 bg-signal/10 text-signal",
  Paid: "border-signal/25 bg-signal/[0.07] text-loop-green",
};

function PaymentPanel({ tutorial, tick, phase, done, reduced, onAction }: StepView) {
  const [userStatus, setUserStatus] = useState<PaymentState>("Open");

  const demoStatus = PAYMENT_STATES[Math.min(tick, 2)].key;
  const locked = tutorial && phase === "demo";
  const status = locked ? demoStatus : userStatus;
  const activeIndex = PAYMENT_STATES.findIndex((s) => s.key === status);
  const current = PAYMENT_STATES[activeIndex];
  const actionable = !tutorial || (phase !== "demo" && !done) || done;

  const handleChip = (key: PaymentState) => {
    if (locked) return;
    setUserStatus(key);
    if (tutorial && !done) onAction();
  };

  return (
    <div className="rounded-[10px] border border-hairline bg-canvas p-5">
      <div className="flex items-center justify-between">
        <PanelTag icon={Wallet}>payment.timeline</PanelTag>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
            STATUS_PILL[status],
          )}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 rounded-[10px] border border-hairline bg-ink px-3 py-2.5 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-fog">{INVOICE_ID}</span>
          <span className="text-bone">{sar(17250)}</span>
        </div>
        <div className="mt-1 flex items-start gap-1.5 text-fog">
          <Clock3 className="mt-0.5 h-3 w-3 shrink-0 text-signal" />
          <span className="min-w-0">{current.receivable}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center">
        {PAYMENT_STATES.map((state, i) => (
          <div key={state.key} className="flex flex-1 items-center last:flex-none">
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                i === activeIndex
                  ? "border-signal bg-signal"
                  : i < activeIndex
                    ? "border-signal/60 bg-signal/25"
                    : "border-graphite bg-canvas",
              )}
            >
              {i < activeIndex ? <Check className="h-2.5 w-2.5 text-signal" /> : null}
              {i === activeIndex ? <span className="h-1.5 w-1.5 rounded-full bg-ink" /> : null}
            </span>
            {i < PAYMENT_STATES.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1 transition-colors",
                  i < activeIndex ? "bg-signal/50" : "bg-hairline",
                )}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mt-4 grid grid-cols-4 gap-1 rounded-[10px] border bg-ink p-1 transition-shadow",
          actionable && tutorial && !done
            ? "cue-ring border-signal/40"
            : "border-hairline",
        )}
      >
        {PAYMENT_STATES.map((state) => {
          const active = state.key === status;
          return (
            <button
              key={state.key}
              type="button"
              {...(state.key === "Open" ? { "data-demo-target": "" } : {})}
              aria-pressed={active}
              disabled={locked}
              onClick={() => handleChip(state.key)}
              className={cn(
                "relative h-8 overflow-hidden rounded-[10px] font-mono text-[11px] uppercase tracking-[0.04em] transition-colors focus-ring",
                active ? "text-ink" : "text-fog hover:text-cloud",
                locked && "cursor-default",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={reduced ? undefined : "demo-payment-active"}
                  className="absolute inset-0 rounded-[10px] bg-signal"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10">{state.key}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-fog">
        <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal" />
        {locked ? "Tracking status automatically…" : "Tap a status to set the receivable state."}
      </p>
      <p className="mt-3 border-t border-hairline pt-3 text-[11px] leading-relaxed text-fog">
        Invoice/payment status tracking, not payment processing.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step registry                                                       */
/* ------------------------------------------------------------------ */

const STEPS: {
  label: string;
  tag: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
  panel: (view: StepView) => ReactNode;
}[] = [
  {
    label: "Customer",
    tag: "customer.record",
    icon: UserRound,
    eyebrow: "Step 1 · Customer",
    title: "Save the customer once",
    description:
      "Keep a client's details (name, VAT number, contact, payment terms, and address) in one record. Saved customers can be reused across every future invoice.",
    panel: (v) => <CustomerPanel {...v} />,
  },
  {
    label: "Invoice",
    tag: "invoice.build",
    icon: FileText,
    eyebrow: "Step 2 · Invoice",
    title: "Build a VAT-aware invoice",
    description:
      "Pull the saved customer into a new invoice and add service lines. Subtotal, VAT, and total update together for KSA's 15% VAT rate.",
    panel: (v) => <InvoicePanel {...v} />,
  },
  {
    label: "VAT readiness",
    tag: "vat.readiness",
    icon: ListChecks,
    eyebrow: "Step 3 · VAT readiness",
    title: "Check readiness before sending",
    description:
      "A readiness pass confirms the essentials (seller VAT, customer VAT, line items, and payment terms) before an invoice goes out.",
    note: "VAT readiness foundation, not certified ZATCA compliance.",
    panel: (v) => <VatReadinessPanel {...v} />,
  },
  {
    label: "Payment",
    tag: "payment.status",
    icon: Wallet,
    eyebrow: "Step 4 · Payment tracking",
    title: "Track payment status",
    description:
      "Once sent, each invoice moves through Draft, Sent, Open, and Paid. The receivable state and due date update to match.",
    note: "This is status tracking, not payment processing.",
    panel: (v) => <PaymentPanel {...v} />,
  },
];

const LAST = STEPS.length - 1;

/** Fully-revealed `tick` per step (also the reduced-motion / mobile target). */
const REVEAL_TICK = [CUSTOMER_ROWS.length, 1, 1, 2];

/**
 * Per-step demo choreography:
 *  - early: content builds up as ambience while the ghost cursor approaches
 *    (customer fields filling in, payment status progressing Draft→Sent→Open).
 *  - onActReveal: content reveals at the ghost cursor's click instead
 *    (the invoice line is "added" when the cursor clicks Add line item).
 */
const STEP_DEMO: { early: boolean; onActReveal: boolean }[] = [
  { early: true, onActReveal: false }, // customer
  { early: false, onActReveal: true }, // invoice
  { early: false, onActReveal: false }, // vat
  { early: true, onActReveal: false }, // payment
];

/* ------------------------------------------------------------------ */
/* Tutorial instruction copy                                           */
/* ------------------------------------------------------------------ */

const TUTORIAL_COPY: Record<Phase, { title: string; body: string }>[] = [
  {
    demo: {
      title: "Filling the customer record",
      body: "Watch the client's details populate: name, VAT number, contact, terms, and address.",
    },
    action: {
      title: "Your turn: save the customer",
      body: "Click “Save customer” in the panel to store this record for reuse.",
    },
    done: {
      title: "Customer saved",
      body: "Stored as CUS-117. Now reusable on every future invoice.",
    },
  },
  {
    demo: {
      title: "Starting the invoice",
      body: "The saved customer is attached and the first service line is added, so totals update automatically.",
    },
    action: {
      title: "Your turn: add a service line",
      body: "Click “Add line item” to add the onboarding workshop and watch subtotal, VAT, and total update.",
    },
    done: {
      title: "Invoice generated",
      body: "Two VAT-aware lines. INV-1208 totals SAR 17,250.",
    },
  },
  {
    demo: {
      title: "Readiness checks",
      body: "Four checks confirm an invoice is ready: seller VAT, customer VAT, line items, and payment terms.",
    },
    action: {
      title: "Your turn: run the check",
      body: "Click “Run VAT readiness check”. VAT readiness foundation, not certified ZATCA compliance.",
    },
    done: {
      title: "Readiness checks passed",
      body: "4 / 4 passed. VAT readiness foundation, not certified ZATCA compliance.",
    },
  },
  {
    demo: {
      title: "Tracking payment status",
      body: "Once issued, the invoice moves Draft → Sent → Open automatically.",
    },
    action: {
      title: "Your turn: set the status",
      body: "Click a status control to track the receivable. Status tracking, not payment processing.",
    },
    done: {
      title: "Payment status tracked",
      body: "The receivable updates with each status. Status tracking, not payment processing.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Tutorial card                                                       */
/* ------------------------------------------------------------------ */

const TutorialCard = forwardRef<
  HTMLDivElement,
  {
    step: number;
    phase: Phase;
    done: boolean;
    onBack: () => void;
    onNext: () => void;
    onExit: () => void;
  }
>(function TutorialCard({ step, phase, done, onBack, onNext, onExit }, ref) {
  const copy = TUTORIAL_COPY[step][phase];
  const isLast = step === LAST;

  // One-shot success feedback: when the user finishes a step's action (done
  // flips false→true), briefly pulse the just-unlocked Next/Finish button so
  // the eye is drawn to "you can continue now".
  const [flash, setFlash] = useState(false);
  const prevDone = useRef(done);
  useEffect(() => {
    if (done && !prevDone.current) {
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 1300);
      prevDone.current = done;
      return () => window.clearTimeout(t);
    }
    prevDone.current = done;
  }, [done]);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="region"
      aria-label="Guided walkthrough instructions"
      className="rounded-[14px] border border-signal/40 bg-ink/95 p-5 shadow-[0_0_0_1px_rgba(168,255,83,0.18),0_18px_50px_-12px_rgba(0,0,0,0.7)] outline-none"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-signal">
          <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal" />
          Guided walkthrough
        </span>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1 rounded-[10px] px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-fog transition-colors hover:text-bone focus-ring"
        >
          <X className="h-3.5 w-3.5" /> Exit
        </button>
      </div>

      {/* progress dots */}
      <div className="mt-4 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s.label}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < step ? "bg-signal/60" : i === step ? "bg-signal" : "bg-hairline",
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-fog">
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          {phase === "action" ? (
            <motion.span
              key="turn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-signal/50 bg-signal/15 px-2 py-0.5 font-semibold tracking-[0.12em] text-signal"
            >
              <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal" />
              Your turn
            </motion.span>
          ) : phase === "done" ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
              className="inline-flex items-center gap-1 text-signal"
            >
              <Check className="h-3 w-3" /> Done
            </motion.span>
          ) : (
            <motion.span
              key="demo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1.5 text-fog"
            >
              <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal/60" />
              Demonstrating…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* live-updating instruction */}
      <div aria-live="polite" className="mt-4 min-h-[84px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${phase}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="font-display text-lg font-medium tracking-[0.02em] text-bone">
              {copy.title}
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fog">{copy.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 0}
          className={buttonStyles("secondary", "sm", "flex-1")}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <motion.div
          className="flex-1"
          animate={flash ? { scale: [1, 1.045, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <button
            type="button"
            data-demo-next
            onClick={onNext}
            disabled={!done}
            className={cn(
              buttonStyles("primary", "sm", "w-full"),
              done && flash && "shadow-[0_0_0_1px_rgba(168,255,83,0.55),0_0_24px_-4px_rgba(168,255,83,0.65)]",
            )}
          >
            {done ? null : <Lock className="h-3.5 w-3.5" />}
            {isLast ? "Finish" : "Next"}
            {done ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </motion.div>
      </div>
      {!done ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-fog">
          <Lock className="h-3 w-3" />
          {isLast ? "Finish" : "Next"} unlocks after this step
        </p>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-signal"
        >
          <Check className="h-3 w-3" />
          Step complete, {isLast ? "finish up" : "you can continue"}
        </motion.p>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Completion card                                                     */
/* ------------------------------------------------------------------ */

const RECAP = [
  "Customer saved as a reusable record",
  "Invoice generated with VAT-aware totals",
  "VAT readiness checked",
  "Payment status tracked",
];

const CompletionCard = forwardRef<
  HTMLDivElement,
  { onReplay: () => void; onExit: () => void }
>(function CompletionCard({ onReplay, onExit }, ref) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label="Walkthrough complete"
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md rounded-[14px] border border-signal/45 bg-ink p-6 shadow-[0_0_0_1px_rgba(168,255,83,0.2),0_30px_80px_-20px_rgba(0,0,0,0.8)] outline-none sm:p-7"
    >
      <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-signal/30 bg-signal/10 text-signal">
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-2xl font-medium tracking-[0.02em] text-bone">
        You’ve completed the demo workflow
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fog">
        That’s the core loop, end to end:
      </p>
      <ul className="mt-4 space-y-2.5">
        {RECAP.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] text-cloud">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2.5">
        <Link href="/pricing" className={buttonStyles("primary", "md", "w-full")}>
          Request pilot access <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="flex gap-2.5">
          <button type="button" onClick={onReplay} className={buttonStyles("secondary", "md", "flex-1")}>
            <RotateCcw className="h-4 w-4" /> Replay
          </button>
          <button type="button" onClick={onExit} className={buttonStyles("ghost", "md", "flex-1")}>
            Exit
          </button>
        </div>
      </div>
      <p className="mt-4 border-t border-hairline pt-3 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-fog">
        Demo data only, nothing was saved
      </p>
      </motion.div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function DemoWalkthrough() {
  const reduced = Boolean(useReducedMotion());
  const [tutorial, setTutorial] = useState(false);
  const [finished, setFinished] = useState(false);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("done");
  const [tick, setTick] = useState(0);
  const [actionsDone, setActionsDone] = useState<boolean[]>([false, false, false, false]);
  // Bumped (debounced) on resize / orientation change so the ghost cursor
  // remounts and recomputes its path against the new layout — keeping it on the
  // correct controls at any window size, fullscreen or not.
  const [layoutNonce, setLayoutNonce] = useState(0);

  const actionsDoneRef = useRef(actionsDone);
  actionsDoneRef.current = actionsDone;

  const cardRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);

  const active = STEPS[step];
  const isLast = step === LAST;

  /* ----- start / exit / replay -------------------------------------- */

  const startTutorial = useCallback(() => {
    track(AnalyticsEvent.StartWalkthrough);
    setActionsDone([false, false, false, false]);
    setFinished(false);
    setStep(0);
    setTutorial(true);
    requestAnimationFrame(() => {
      document
        .getElementById("walkthrough")
        ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  }, [reduced]);

  const exitTutorial = useCallback(() => {
    // Defensive: ensure no ghost-cursor highlight survives the close.
    document
      .querySelectorAll(".ghost-hovered")
      .forEach((el) => el.classList.remove("ghost-hovered"));
    setTutorial(false);
    setFinished(false);
    setStep(0);
    setPhase("done");
  }, []);

  const replay = useCallback(() => {
    setActionsDone([false, false, false, false]);
    setFinished(false);
    setStep((s) => (s === 0 ? 0 : 0));
    // ensure demo re-runs even if already on step 0
    setPhase("demo");
    setTick(0);
  }, []);

  /* ----- deep-link start via #start-walkthrough --------------------- */

  useEffect(() => {
    const check = () => {
      if (window.location.hash === "#start-walkthrough") startTutorial();
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [startTutorial]);

  /* ----- escape to exit --------------------------------------------- */

  useEffect(() => {
    if (!tutorial) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitTutorial();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tutorial, exitTutorial]);

  /* ----- recompute cursor path on resize / orientation -------------- */

  // Debounced so it fires once the resize settles (not on every intermediate
  // frame); bumping the nonce remounts the cursor/hint, which re-reads every
  // target's live getBoundingClientRect() and rebuilds the path.
  useEffect(() => {
    if (!tutorial || reduced) return;
    let t = 0;
    const bump = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setLayoutNonce((n) => n + 1), 220);
    };
    window.addEventListener("resize", bump);
    window.addEventListener("orientationchange", bump);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", bump);
      window.removeEventListener("orientationchange", bump);
    };
  }, [tutorial, reduced]);

  /* ----- per-step demo driver --------------------------------------- */

  useEffect(() => {
    if (!tutorial) return;
    const full = REVEAL_TICK[step];
    if (actionsDoneRef.current[step]) {
      setTick(full);
      setPhase("done");
      return;
    }
    setTick(0);
    setPhase("demo");

    // Reduced motion: no animation, no cursor — reveal + unlock instantly. A
    // StaticHint (rendered below) points at the action control instead.
    if (reduced) {
      setTick(full);
      setPhase("action");
      return;
    }

    // Motion on (any viewport — fullscreen, resized window, tablet, mobile):
    // the GhostCursor (rendered below) drives reveal (onAct) and the demo→action
    // handoff (onEnd). Here we only run the ambient build-up for "early" steps,
    // plus a safety timeout so we never stick in demo.
    let rampId = 0;
    if (STEP_DEMO[step].early) {
      let t = 0;
      rampId = window.setInterval(() => {
        t += 1;
        setTick(t);
        if (t >= full) window.clearInterval(rampId);
      }, 240);
    }
    const safety = window.setTimeout(() => {
      // Only rescue a genuinely stuck demo — never override a step the user has
      // already advanced past (phase "action"/"done"), or Next/Finish would break.
      setPhase((p) => (p === "demo" ? "action" : p));
      setTick((t) => (t >= full ? t : full));
    }, 4200);
    return () => {
      if (rampId) window.clearInterval(rampId);
      window.clearTimeout(safety);
    };
  }, [tutorial, step, reduced]);

  /* ----- focus management ------------------------------------------- */

  useEffect(() => {
    if (tutorial && !finished) cardRef.current?.focus();
  }, [tutorial, step, finished]);

  useEffect(() => {
    if (tutorial && finished) completionRef.current?.focus();
  }, [tutorial, finished]);

  /* ----- handlers --------------------------------------------------- */

  const completeAction = useCallback(() => {
    setActionsDone((prev) => {
      if (prev[step]) return prev;
      const next = [...prev];
      next[step] = true;
      return next;
    });
    setPhase("done");
  }, [step]);

  const goNext = useCallback(() => {
    // Gate on the action actually being completed — not on `phase`, which a
    // late safety timeout can momentarily flip back to "action".
    if (!actionsDoneRef.current[step]) return;
    if (isLast) {
      track(AnalyticsEvent.DemoCompleted);
      setFinished(true);
    } else {
      setStep((s) => s + 1);
    }
  }, [step, isLast]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const passiveGo = (i: number) => setStep(Math.min(LAST, Math.max(0, i)));

  const view: StepView = {
    tutorial,
    tick,
    phase,
    done: actionsDone[step],
    reduced,
    onAction: completeAction,
  };

  return (
    <>
      {/* dim overlay — fades in/out so tutorial entry/exit isn't abrupt.
          Opacity-only (no transform) to stay clear of the spotlight's fixed
          stacking context. */}
      <AnimatePresence>
        {tutorial ? (
          <motion.div
            key="demo-dim"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[55] bg-ink/72 backdrop-blur-[2px]"
          />
        ) : null}
      </AnimatePresence>

      {/* Ghost tutorial cursor — shown across every viewport (fullscreen,
          resized window, tablet, mobile) whenever motion is allowed. Stays
          mounted until the step's action is done so it can demo the action AND
          then rest on Next/Finish as a forward cue (it never clicks them).
          Re-keyed on `layoutNonce` so a resize / orientation change remounts it
          and recomputes the path against the new layout. */}
      {tutorial && !finished && !reduced && !actionsDone[step] ? (
        <GhostCursor
          key={`${step}-${layoutNonce}`}
          onAct={() => {
            if (STEP_DEMO[step].onActReveal) setTick(REVEAL_TICK[step]);
          }}
          onEnd={() => {
            setTick(REVEAL_TICK[step]);
            setPhase("action");
          }}
        />
      ) : null}

      {/* Reduced-motion: a static "act here" hint in place of the animated
          cursor. Re-keyed per step + on layout settle so it tracks the target. */}
      {tutorial && !finished && reduced && !actionsDone[step] ? (
        <StaticHint key={`hint-${step}-${layoutNonce}`} />
      ) : null}

      {/* idle start banner */}
      {!tutorial ? (
        <div
          id="start-walkthrough"
          className="mb-6 flex flex-col items-start justify-between gap-4 rounded-[10px] border border-signal/35 bg-ink p-5 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-signal/25 bg-signal/10 text-signal">
              <Play className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-medium text-bone">Take the guided walkthrough</div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-fog">
                A spotlighted, 4-step tutorial where you perform each action on demo data.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={startTutorial}
            className={buttonStyles("primary", "md", "w-full shrink-0 sm:w-auto")}
          >
            Start walkthrough <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div data-demo-stage className={cn("relative", tutorial && "z-[60]")}>
        <div
          className={cn(
            tutorial && "lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8",
          )}
        >
          {/* spotlight column */}
          <div className="min-w-0">
            {/* step indicators */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STEPS.map((s, i) => {
                const state = i === step ? "active" : actionsDone[i] || i < step ? "done" : "todo";
                return (
                  <button
                    key={s.label}
                    type="button"
                    aria-current={i === step}
                    disabled={tutorial}
                    onClick={() => passiveGo(i)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors focus-ring",
                      i === step
                        ? "border-signal/50 bg-signal/[0.06]"
                        : "border-hairline bg-ink",
                      !tutorial && "hover:border-graphite",
                      tutorial && "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[11px]",
                        i === step
                          ? "border-signal bg-signal text-ink"
                          : state === "done"
                            ? "border-signal/40 bg-signal/10 text-signal"
                            : "border-hairline bg-canvas text-fog",
                      )}
                    >
                      {state === "done" && i !== step ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 truncate text-[13px] font-medium",
                        state === "todo" ? "text-fog" : "text-bone",
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* workspace window — spotlighted in tutorial mode */}
            <div
              className={cn(
                "mt-5 overflow-hidden rounded-[10px] border bg-ink transition-shadow duration-300",
                tutorial
                  ? "border-signal/50 shadow-[0_0_0_1px_rgba(168,255,83,0.35),0_0_55px_-12px_rgba(168,255,83,0.4)]"
                  : "border-hairline",
              )}
            >
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[10px] border border-signal/25 bg-signal/10 text-signal">
                    <Radio className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate font-mono text-[11px] text-cloud">
                    workspace://demo/{active.tag}
                  </span>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-signal/25 bg-canvas px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-fog">
                  <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-signal" />
                  Demo data
                </span>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <StepBody reduced={reduced} step={step} tutorial={tutorial} view={view} />
              </div>
            </div>

            {/* passive controls (idle only) */}
            {!tutorial ? (
              <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => passiveGo(step - 1)}
                  disabled={step === 0}
                  className={buttonStyles("secondary", "md", "w-full sm:w-auto")}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <span className="text-center font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
                  Step {step + 1} of {STEPS.length} · {active.label}
                </span>
                {isLast ? (
                  <Link href="/pricing" className={buttonStyles("primary", "md", "w-full sm:w-auto")}>
                    Request pilot access <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => passiveGo(step + 1)}
                    className={buttonStyles("primary", "md", "w-full sm:w-auto")}
                  >
                    Next step <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* tutorial instruction card — right rail (desktop) / below (mobile) */}
          {tutorial && !finished ? (
            <div className="mt-6 lg:mt-0 lg:sticky lg:top-24">
              <TutorialCard
                ref={cardRef}
                step={step}
                phase={phase}
                done={actionsDone[step]}
                onBack={goBack}
                onNext={goNext}
                onExit={exitTutorial}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* completion */}
      {tutorial && finished ? (
        <CompletionCard ref={completionRef} onReplay={replay} onExit={exitTutorial} />
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step body — narrative (passive) or compact header (tutorial) + panel */
/* ------------------------------------------------------------------ */

function StepBody({
  reduced,
  step,
  tutorial,
  view,
}: {
  reduced: boolean;
  step: number;
  tutorial: boolean;
  view: StepView;
}) {
  const active = STEPS[step];

  const content = tutorial ? (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-hairline bg-canvas text-signal">
          <active.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-signal">
            {active.eyebrow}
          </div>
          <div className="truncate font-display text-lg font-medium tracking-[0.02em] text-bone">
            {active.title}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-5 max-w-md">{active.panel(view)}</div>
    </div>
  ) : (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-hairline bg-canvas text-signal">
            <active.icon className="h-4 w-4" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-signal">
            {active.eyebrow}
          </span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
          {active.title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-fog">{active.description}</p>
        {active.note ? (
          <p className="mt-4 flex items-start gap-2 rounded-[10px] border border-hairline bg-canvas/60 p-3 text-xs leading-relaxed text-fog">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
            {active.note}
          </p>
        ) : null}
        <div className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] text-fog">
          <SaudiRiyal className="h-3.5 w-3.5 text-signal" />
          Demo only, nothing is saved and no real invoice is created.
        </div>
      </div>
      <div className="min-w-0">{active.panel(view)}</div>
    </div>
  );

  if (reduced) return content;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${step}-${tutorial ? "t" : "p"}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
