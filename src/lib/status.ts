import type { EffectiveStatus, Invoice, Tone } from "@/types";
import { todayISO } from "./format";

/**
 * Derive the status shown in the UI. "Overdue" is never stored — it's computed
 * from a sent invoice whose due date has passed. This keeps the data clean and
 * avoids stale flags.
 */
export function getEffectiveStatus(invoice: Pick<Invoice, "status" | "dueDate">): EffectiveStatus {
  if (invoice.status === "paid") return "paid";
  if (invoice.status === "sent" && invoice.dueDate && invoice.dueDate < todayISO()) {
    return "overdue";
  }
  return invoice.status;
}

export const STATUS_META: Record<EffectiveStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "gray" },
  sent: { label: "Sent", tone: "blue" },
  paid: { label: "Paid", tone: "green" },
  overdue: { label: "Overdue", tone: "red" },
};

/** Ordered list used for filter tabs. */
export const STATUS_FILTERS: { id: "all" | EffectiveStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];
