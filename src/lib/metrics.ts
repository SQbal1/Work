import type { Invoice } from "@/types";
import { computeTotals, round2 } from "./calc";
import { getEffectiveStatus } from "./status";

/** Grand total for a stored invoice (derived from its line items + discount). */
export function invoiceTotal(invoice: Invoice): number {
  return computeTotals(invoice.items, invoice.discountPercent).total;
}

export interface DashboardMetrics {
  totalCount: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  thisMonthRevenue: number;
  outstanding: number;
  monthly: { label: string; value: number }[];
}

/** Everything the dashboard needs, computed from the invoice list. */
export function computeDashboard(invoices: Invoice[], now = new Date()): DashboardMetrics {
  let paidCount = 0;
  let unpaidCount = 0;
  let overdueCount = 0;
  let outstanding = 0;
  let thisMonthRevenue = 0;

  // Build the last 7 month buckets (oldest → current).
  const buckets: { key: string; label: string }[] = [];
  const totals = new Map<string, number>();
  const fmt = new Intl.DateTimeFormat("en-GB", { month: "short" });
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.push({ key, label: fmt.format(d) });
    totals.set(key, 0);
  }
  const thisKey = `${now.getFullYear()}-${now.getMonth()}`;

  for (const inv of invoices) {
    const eff = getEffectiveStatus(inv);
    const total = invoiceTotal(inv);

    if (inv.status === "paid") {
      paidCount++;
      const d = new Date(`${inv.paidDate || inv.issueDate}T00:00:00`);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + total);
      if (key === thisKey) thisMonthRevenue += total;
    }
    if (eff === "sent" || eff === "overdue") {
      unpaidCount++;
      outstanding += total;
    }
    if (eff === "overdue") overdueCount++;
  }

  return {
    totalCount: invoices.length,
    paidCount,
    unpaidCount,
    overdueCount,
    thisMonthRevenue: round2(thisMonthRevenue),
    outstanding: round2(outstanding),
    monthly: buckets.map((b) => ({ label: b.label, value: round2(totals.get(b.key) ?? 0) })),
  };
}
