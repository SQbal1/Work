import { brand } from "@/config/brand";

/** Just the numeric part, e.g. "1,250.00" — shared by formatCurrency and <Money>. */
export function formatAmount(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

/** Format money as e.g. "1,250.00 SAR" (amount first reads best in an English UI). */
export function formatCurrency(amount: number, currency: string = brand.currency): string {
  return `${formatAmount(amount)} ${currency}`;
}

/** Compact money for charts/tight spaces, e.g. "12.5k SAR". */
export function formatCompactCurrency(amount: number, currency: string = brand.currency): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(safe);
  return `${formatted} ${currency}`;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a yyyy-mm-dd string as *local* midnight (avoids timezone day-shifts). */
function parseISODate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Today as yyyy-mm-dd (for <input type="date"> and comparisons). */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Add days to a yyyy-mm-dd date, returning yyyy-mm-dd. */
export function addDaysISO(baseISO: string, days: number): string {
  const d = parseISODate(baseISO) ?? new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Human date, e.g. "16 Jun 2026". */
export function formatDate(iso: string): string {
  const d = parseISODate(iso) ?? (iso ? new Date(iso) : null);
  if (!d || Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Short month label for charts, e.g. "Jun". */
export function monthShort(iso: string): string {
  const d = parseISODate(iso) ?? new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d);
}

/** First 1–2 initials of a name, for avatars. */
export function initials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
