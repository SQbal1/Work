"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Clock3,
  FileText,
  ListChecks,
  Radio,
  SaudiRiyal,
  Send,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { SPRINGS, WORKFLOW_TIMING } from "@/components/marketing/motion";
import type { Tone } from "@/types";

const ISSUE_DATE = "17 Jun 2026";
const INVOICE_NO = 1248;

const logs = [
  { step: 0, tone: "text-cloud", value: "request.received: Bayan Technologies, SAR 12,000" },
  { step: 1, tone: "text-signal", value: "signal.map: client request -> invoice workspace" },
  { step: 2, tone: "text-cloud", value: "customer.set: Bayan Technologies LLC" },
  { step: 3, tone: "text-cloud", value: "line_item.add: Monthly advisory retainer" },
  { step: 4, tone: "text-signal", value: "vat.calculate: 15% = SAR 1,800" },
  { step: 5, tone: "text-signal", value: "check.customer_vat: valid" },
  { step: 6, tone: "text-cloud", value: "payment.state: Draft -> Sent" },
  { step: 7, tone: "text-cloud", value: "payment.state: Sent -> Open" },
  { step: 8, tone: "text-signal", value: "invoice.ready_for_review: true" },
];

const storyLabels = [
  "Client request",
  "Mapping request",
  "Customer matched",
  "Service added",
  "VAT calculated",
  "Customer validated",
  "Invoice sent",
  "Payment open",
  "Ready for review",
];

const paymentStates = ["Draft", "Sent", "Open"] as const;

function useWorkflowStep(active: boolean, staticMode: boolean) {
  const prefersReducedMotion = useReducedMotion();
  const reduced = Boolean(prefersReducedMotion) || staticMode;
  const [step, setStep] = useState(reduced ? WORKFLOW_TIMING.finalStep : 0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStep(WORKFLOW_TIMING.finalStep);
      return;
    }
    if (!active) return;

    let timers: number[] = [];

    const clearTimers = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
    };

    const runCycle = () => {
      clearTimers();
      setStep(0);
      setCycle((current) => current + 1);
      WORKFLOW_TIMING.checkpoints.slice(1).forEach((checkpoint, index) => {
        timers.push(window.setTimeout(() => setStep(index + 1), checkpoint));
      });
    };

    runCycle();
    const interval = window.setInterval(runCycle, WORKFLOW_TIMING.loopMs);

    return () => {
      window.clearInterval(interval);
      clearTimers();
    };
  }, [active, reduced]);

  return { cycle, reduced, step };
}

export function HeroWorkflowPreview({
  active = true,
  staticMode = false,
}: {
  active?: boolean;
  staticMode?: boolean;
}) {
  const { cycle, reduced, step } = useWorkflowStep(active, staticMode);
  const invoiceId = `INV-${INVOICE_NO}`;
  const headerStatus = getHeaderStatus(step);

  return (
    <div className="relative overflow-hidden rounded-[4px] border border-hairline bg-ink lg:flex lg:h-full lg:flex-col">
      <SignalTransfer step={step} reduced={reduced} />

      <div className="relative z-10 border-b border-hairline bg-ink/96 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] border border-signal/25 bg-signal/10 text-signal">
              <Radio className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-cloud">
                workspace://receivables/{invoiceId}
              </div>
              <div className="relative mt-1 h-4">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={`${cycle}-${step}`}
                    initial={reduced ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -5 }}
                    transition={SPRINGS.state}
                    className="absolute inset-0 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.08em] text-fog"
                  >
                    {storyLabels[step]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <motion.div
            className="flex min-w-[74px] shrink-0 justify-end"
            key={headerStatus.label}
            initial={reduced ? false : { opacity: 0, x: 8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={SPRINGS.state}
          >
            <Badge tone={headerStatus.tone} dot>
              {headerStatus.label}
            </Badge>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 grid gap-px bg-hairline lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.3fr)_minmax(0,0.9fr)] lg:grid-rows-[458px_minmax(0,1fr)]">
        <ClientRequestLane step={step} reduced={reduced} />
        <InvoiceWorkspace issueDate={ISSUE_DATE} invoiceId={invoiceId} reduced={reduced} step={step} />
        <ValidationRail reduced={reduced} step={step} />
        <InvoiceLog step={step} reduced={reduced} />
      </div>
    </div>
  );
}

function SignalTransfer({ step, reduced }: { step: number; reduced: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
      preserveAspectRatio="none"
      viewBox="0 0 1000 620"
    >
      <path
        d="M 176 250 C 246 250 278 294 372 294"
        fill="none"
        stroke="rgba(59, 62, 69, 0.84)"
        strokeWidth="1"
      />
      <motion.path
        d="M 176 250 C 246 250 278 294 372 294"
        fill="none"
        initial={false}
        animate={{ pathLength: step >= 1 ? 1 : 0, opacity: step >= 1 ? 1 : 0.16 }}
        stroke="rgb(168, 255, 83)"
        strokeLinecap="round"
        strokeWidth="2"
        transition={reduced ? { duration: 0 } : SPRINGS.line}
      />
      <motion.circle
        animate={{
          cx: step >= 1 ? 372 : 176,
          cy: step >= 1 ? 294 : 250,
          opacity: step >= 1 && step <= 4 ? 1 : 0,
        }}
        cx="176"
        cy="250"
        fill="rgb(168, 255, 83)"
        initial={reduced ? false : { cx: 176, cy: 250, opacity: 0 }}
        r="3.5"
        transition={reduced ? { duration: 0 } : SPRINGS.line}
      />
    </svg>
  );
}

function ClientRequestLane({ step, reduced }: { step: number; reduced: boolean }) {
  return (
    <section className="min-w-0 bg-canvas p-4 sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-fog">Request lane</div>
          <h3 className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-display text-lg font-medium tracking-[0.025em] text-bone">
            Client request
          </h3>
        </div>
        <Clock3 className="h-4 w-4 shrink-0 text-fog" />
      </div>

      <motion.div
        animate={{
          borderColor: step >= 0 ? "rgba(168, 255, 83, 0.34)" : "rgba(39, 42, 46, 1)",
          y: step === 0 && !reduced ? -2 : 0,
        }}
        className="mt-4 overflow-hidden rounded-[4px] border border-hairline bg-ink p-4"
        initial={false}
        transition={SPRINGS.state}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border border-hairline bg-canvas text-signal">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-bone">
              Bayan Technologies
            </div>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-fog">
              finance@bayan.sa
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-cloud">
          Issue June advisory retainer with VAT, Net 14 terms, and send it for review.
        </p>
        <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 font-mono text-[11px]">
          <Metric label="Amount" value="SAR 12,000" />
          <Metric label="Terms" value="Net 14" />
        </div>
      </motion.div>

      <div className="mt-4 overflow-hidden text-ellipsis whitespace-nowrap rounded-[4px] border border-hairline bg-ink px-3 py-2 font-mono text-[11px] text-fog">
        request.id <span className="text-cloud">REQ-438</span>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[4px] border border-hairline bg-canvas px-2.5 py-2">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-fog">{label}</div>
      <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-cloud">{value}</div>
    </div>
  );
}

function InvoiceWorkspace({
  invoiceId,
  issueDate,
  reduced,
  step,
}: {
  invoiceId: string;
  issueDate: string;
  reduced: boolean;
  step: number;
}) {
  const customerReady = step >= 2;
  const itemReady = step >= 3;
  const vatReady = step >= 4;

  return (
    <section className="min-w-0 bg-canvas p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-fog">
            Invoice workspace
          </div>
          <h3 className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-medium tracking-[0.025em] text-bone">
            Consulting retainer
          </h3>
        </div>
        <span className="w-fit shrink-0 rounded-full border border-signal/20 bg-signal/10 px-3 py-1 font-mono text-[11px] text-signal">
          {invoiceId}
        </span>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(118px,0.8fr)]">
        <AnimatedField
          active={customerReady}
          label="Customer"
          reduced={reduced}
          value={customerReady ? "Bayan Technologies LLC" : "Waiting for request mapping"}
        />
        <AnimatedField active label="Issue date" reduced={reduced} value={issueDate} />
      </div>

      <div className="mt-4 overflow-hidden rounded-[4px] border border-hairline bg-ink">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_54px_96px] gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.06em] text-fog sm:grid-cols-[minmax(0,1fr)_64px_112px]">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">Description</span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-right">Qty</span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-right">Amount</span>
        </div>
        <InvoiceRow
          active={itemReady}
          amount="SAR 12,000"
          label="Monthly advisory retainer"
          qty="1"
          reduced={reduced}
        />
        <InvoiceRow
          active={vatReady}
          amount="SAR 1,800"
          label="VAT 15%"
          qty="-"
          reduced={reduced}
          signal
        />
        <div className="flex min-w-0 items-center justify-between gap-3 border-t border-hairline px-4 py-3">
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-fog">Total due</span>
          <span className="relative h-8 w-[154px] shrink-0">
            <AnimatePresence initial={false}>
              <motion.span
                key={vatReady ? "vat-total" : "net-total"}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "absolute inset-0 overflow-hidden text-ellipsis whitespace-nowrap text-right font-mono text-2xl font-semibold",
                  vatReady ? "text-signal" : "text-bone",
                )}
                exit={reduced ? undefined : { opacity: 0, y: -5, scale: 0.99 }}
                initial={reduced ? false : { opacity: 0, y: 7, scale: 0.99 }}
                transition={SPRINGS.state}
              >
                {vatReady ? "SAR 13,800" : "SAR 12,000"}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>
    </section>
  );
}

function AnimatedField({
  active,
  label,
  reduced,
  value,
}: {
  active: boolean;
  label: string;
  reduced: boolean;
  value: string;
}) {
  return (
    <motion.div
      animate={{
        borderColor: active ? "rgba(168, 255, 83, 0.24)" : "rgba(39, 42, 46, 1)",
        backgroundColor: active ? "rgba(18, 19, 23, 1)" : "rgba(18, 19, 23, 0.72)",
      }}
      className="min-h-[72px] min-w-0 overflow-hidden rounded-[4px] border border-hairline bg-ink px-3 py-2.5"
      initial={false}
      transition={SPRINGS.state}
    >
      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] text-fog">
        {label}
      </div>
      <div className="relative mt-2 h-5">
        <AnimatePresence initial={false}>
          <motion.div
            key={value}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "absolute inset-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm",
              active ? "text-bone" : "text-fog",
            )}
            exit={reduced ? undefined : { opacity: 0, x: -6 }}
            initial={reduced ? false : { opacity: 0, x: 8 }}
            transition={SPRINGS.state}
          >
            {value}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function InvoiceRow({
  active,
  amount,
  label,
  qty,
  reduced,
  signal = false,
}: {
  active: boolean;
  amount: string;
  label: string;
  qty: string;
  reduced: boolean;
  signal?: boolean;
}) {
  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.5,
        scale: active ? 1 : 0.992,
        x: active || reduced ? 0 : -4,
        backgroundColor: active && signal ? "rgba(168, 255, 83, 0.045)" : "rgba(28, 30, 33, 0)",
      }}
      className="grid min-h-[50px] min-w-0 grid-cols-[minmax(0,1fr)_54px_96px] gap-3 border-t border-hairline px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_64px_112px]"
      initial={false}
      transition={SPRINGS.state}
    >
      <span
        className={cn(
          "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
          active ? "text-cloud" : "text-fog",
        )}
      >
        {active ? label : "Awaiting invoice data"}
      </span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-right font-mono text-fog">
        {active ? qty : ""}
      </span>
      <span
        className={cn(
          "overflow-hidden text-ellipsis whitespace-nowrap text-right font-mono",
          active ? "text-bone" : "text-fog",
        )}
      >
        {active ? amount : "-"}
      </span>
    </motion.div>
  );
}

function ValidationRail({ reduced, step }: { reduced: boolean; step: number }) {
  const checks = [
    { at: 5, label: "Customer VAT number", value: "300458921700003" },
    { at: 6, label: "VAT total matched", value: "SAR 1,800" },
    { at: 7, label: "Receivable state", value: "Open" },
  ];
  const activePaymentIndex = step >= 7 ? 2 : step >= 6 ? 1 : 0;

  return (
    <aside className="min-w-0 bg-canvas p-4 sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.08em] text-fog">
            Validation
          </div>
          <h3 className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-display text-lg font-medium tracking-[0.025em] text-bone">
            VAT and payment
          </h3>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border border-hairline bg-ink text-signal">
          <ListChecks className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {checks.map((check) => {
          const active = step >= check.at;
          return (
            <motion.div
              animate={{
                borderColor: active ? "rgba(168, 255, 83, 0.28)" : "rgba(39, 42, 46, 1)",
                x: active || reduced ? 0 : -3,
              }}
              className="rounded-[4px] border border-hairline bg-ink p-3"
              initial={false}
              key={check.label}
              transition={SPRINGS.state}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                    active
                      ? "border-signal/30 bg-signal/10 text-signal"
                      : "border-hairline bg-canvas text-fog",
                  )}
                >
                  {active ? <Check className="h-3 w-3" /> : null}
                </span>
                <span
                  className={cn(
                    "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm",
                    active ? "text-cloud" : "text-fog",
                  )}
                >
                  {check.label}
                </span>
              </div>
              <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap pl-7 font-mono text-[11px] text-fog">
                {active ? check.value : "pending"}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[4px] border border-hairline bg-ink p-3">
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-fog">
            Payment state
          </span>
          <SaudiRiyal className="h-4 w-4 text-signal" />
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-1 rounded-[4px] border border-hairline bg-canvas p-1">
          {paymentStates.map((state, index) => {
            const active = index === activePaymentIndex;
            return (
              <div
                className={cn(
                  "relative h-8 overflow-hidden rounded-[4px] px-1 text-center font-mono text-[11px] leading-8",
                  active ? "text-ink" : "text-fog",
                )}
                key={state}
              >
                {active ? (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-[4px] bg-signal"
                    initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                    transition={SPRINGS.state}
                  />
                ) : null}
                <span className="relative z-10 block overflow-hidden text-ellipsis whitespace-nowrap">
                  {state}
                </span>
              </div>
            );
          })}
        </div>
        <motion.div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas" initial={false}>
          <motion.div
            animate={{ scaleX: getPaymentScale(activePaymentIndex) }}
            className="h-full origin-left rounded-full bg-signal"
            initial={false}
            transition={SPRINGS.state}
          />
        </motion.div>
      </div>
    </aside>
  );
}

function InvoiceLog({ reduced, step }: { reduced: boolean; step: number }) {
  const visibleLogs = logs.filter((log) => log.step <= step).slice(-5);

  return (
    <section className="min-w-0 bg-ink p-4 sm:p-5 lg:col-span-3 lg:h-full lg:overflow-hidden">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.08em] text-fog">
          <FileText className="h-3.5 w-3.5 text-signal" />
          invoice.log
        </div>
        <Send className="h-4 w-4 shrink-0 text-fog" />
      </div>
      <ul className="mt-3 grid h-[110px] content-start gap-1.5 overflow-hidden font-mono text-[11px] leading-relaxed">
        <AnimatePresence initial={false}>
          {visibleLogs.map((log) => (
            <motion.li
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className={cn("flex min-w-0 items-center gap-2", log.tone)}
              exit={reduced ? undefined : { opacity: 0, x: -8, scale: 0.99 }}
              initial={reduced ? false : { opacity: 0, x: 10, scale: 0.99 }}
              key={log.value}
              transition={SPRINGS.state}
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{log.value}</span>
            </motion.li>
          ))}
        </AnimatePresence>
        <li className="mt-1 text-fog">
          sync.cursor <span className="log-cursor" />
        </li>
      </ul>
    </section>
  );
}

function getHeaderStatus(step: number): { label: string; tone: Tone } {
  if (step >= 8) return { label: "Ready", tone: "green" };
  if (step >= 7) return { label: "Open", tone: "amber" };
  if (step >= 6) return { label: "Sent", tone: "blue" };
  return { label: "Draft", tone: "gray" };
}

function getPaymentScale(activePaymentIndex: number) {
  if (activePaymentIndex === 2) return 1;
  if (activePaymentIndex === 1) return 0.64;
  return 0.32;
}
