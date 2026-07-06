import type { Invoice } from "@/types";
import { computeTotals, round2 } from "./calc";
import { getEffectiveStatus } from "./status";

/** Grand total for a stored invoice (derived from its line items + discount). */
export function invoiceTotal(invoice: Invoice): number {
  return computeTotals(invoice.items, invoice.discountPercent).total;
}

export interface TopCustomer {
  customerId: string;
  revenue: number;
  count: number;
}

export interface DashboardMetrics {
  totalCount: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  /** Revenue collected in the last 30 days. */
  last30Revenue: number;
  /** Revenue collected in the previous 30 days (the baseline for the delta). */
  prev30Revenue: number;
  /** % change of last-30-day collected revenue vs the prior 30 days (null if no baseline). */
  revenueDeltaPct: number | null;
  outstanding: number;
  /** Paid ÷ (sent + paid + overdue), as a 0–100 percentage. */
  collectionRatePct: number;
  /** Average value of a billed (non-draft) invoice. */
  avgInvoiceValue: number;
  /** Invoices issued in the last 30 days vs the prior 30, for the total-invoices delta. */
  issuedDeltaPct: number | null;
  /** Collected revenue per period (7 trailing months, oldest → current). */
  monthly: { label: string; value: number }[];
  /** Invoices issued per period (sparkline for the total-invoices card). */
  monthlyIssued: number[];
  /** Invoices paid per period (sparkline for the paid card). */
  monthlyPaid: number[];
  /** Customers ranked by billed revenue (top first). */
  topCustomers: TopCustomer[];
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return round2(((current - previous) / previous) * 100);
}

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 30;
const WINDOWS = 7;

/**
 * Everything the dashboard needs, computed from the invoice list.
 *
 * Time series use trailing 30-day windows ending today (window 0 = last 30
 * days) rather than calendar months, so the "current period" is always a full
 * window of recent activity — the dashboard looks right on any day, including
 * the 1st of a month.
 */
export function computeDashboard(invoices: Invoice[], now = new Date()): DashboardMetrics {
  let paidCount = 0;
  let unpaidCount = 0;
  let overdueCount = 0;
  let outstanding = 0;
  let billedCount = 0;
  let billedTotal = 0;

  const nowMs = now.getTime();
  // window[0] = most recent 30 days … window[WINDOWS-1] = oldest.
  const revenue = new Array<number>(WINDOWS).fill(0);
  const issued = new Array<number>(WINDOWS).fill(0);
  const paid = new Array<number>(WINDOWS).fill(0);

  const windowOf = (iso: string): number => {
    const t = new Date(`${iso}T00:00:00`).getTime();
    const daysAgo = Math.floor((nowMs - t) / DAY_MS);
    if (daysAgo < 0) return 0; // future-dated → current window
    return Math.min(WINDOWS - 1, Math.floor(daysAgo / WINDOW_DAYS));
  };

  const customerRevenue = new Map<string, { revenue: number; count: number }>();

  for (const inv of invoices) {
    const eff = getEffectiveStatus(inv);
    const total = invoiceTotal(inv);

    issued[windowOf(inv.issueDate)] += 1;

    if (inv.status !== "draft") {
      billedCount++;
      billedTotal += total;
      if (inv.customerId) {
        const c = customerRevenue.get(inv.customerId) ?? { revenue: 0, count: 0 };
        c.revenue += total;
        c.count += 1;
        customerRevenue.set(inv.customerId, c);
      }
    }

    if (inv.status === "paid") {
      paidCount++;
      const w = windowOf(inv.paidDate || inv.issueDate);
      revenue[w] += total;
      paid[w] += 1;
    }
    if (eff === "sent" || eff === "overdue") {
      unpaidCount++;
      outstanding += total;
    }
    if (eff === "overdue") overdueCount++;
  }

  const topCustomers: TopCustomer[] = [...customerRevenue.entries()]
    .map(([customerId, v]) => ({ customerId, revenue: round2(v.revenue), count: v.count }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Label each window by the month at its midpoint; display oldest → newest.
  const fmt = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const order = [...Array(WINDOWS).keys()].reverse(); // [6,5,4,3,2,1,0]
  const label = (w: number) => fmt.format(new Date(nowMs - (w * WINDOW_DAYS + 15) * DAY_MS));

  return {
    totalCount: invoices.length,
    paidCount,
    unpaidCount,
    overdueCount,
    last30Revenue: round2(revenue[0]),
    prev30Revenue: round2(revenue[1]),
    revenueDeltaPct: pctChange(revenue[0], revenue[1]),
    outstanding: round2(outstanding),
    collectionRatePct: billedCount === 0 ? 0 : Math.round((paidCount / billedCount) * 100),
    avgInvoiceValue: billedCount === 0 ? 0 : round2(billedTotal / billedCount),
    issuedDeltaPct: pctChange(issued[0], issued[1]),
    monthly: order.map((w) => ({ label: label(w), value: round2(revenue[w]) })),
    monthlyIssued: order.map((w) => issued[w]),
    monthlyPaid: order.map((w) => paid[w]),
    topCustomers,
  };
}
