import type { InvoiceLineItem, InvoiceTotals } from "@/types";

/** Round to 2 decimal places (money-safe enough for an MVP). */
export function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number(n) || 0));
}

/** Pre-VAT, pre-discount amount for a single line. */
export function lineSubtotal(item: Pick<InvoiceLineItem, "quantity" | "unitPrice">): number {
  return round2((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0));
}

/**
 * Core invoice math. An invoice-level discount (%) is applied to the subtotal,
 * then VAT is charged per line on the post-discount amount (so mixed VAT rates
 * work correctly). This is intentionally simple and readable.
 */
export function computeTotals(
  items: Pick<InvoiceLineItem, "quantity" | "unitPrice" | "vatRate">[],
  discountPercent: number,
): InvoiceTotals {
  const subtotal = items.reduce((sum, i) => sum + lineSubtotal(i), 0);
  const pct = clamp(discountPercent, 0, 100);
  const discountFactor = 1 - pct / 100;
  const discountAmount = subtotal * (pct / 100);
  const vatTotal = items.reduce(
    (sum, i) => sum + lineSubtotal(i) * discountFactor * (Number(i.vatRate) || 0),
    0,
  );
  const total = subtotal - discountAmount + vatTotal;
  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    vatTotal: round2(vatTotal),
    total: round2(total),
  };
}
