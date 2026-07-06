import { brand } from "@/config/brand";
import { formatAmount, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { RiyalSymbol } from "./RiyalSymbol";

/**
 * A currency amount rendered with the official Riyal symbol instead of the
 * "SAR" text suffix. Reserved for a few high-visibility spots (the invoice
 * document, the builder summary, the dashboard's headline figure) — dense
 * tables and CSV/aria contexts keep the plain formatCurrency() string.
 */
export function Money({
  amount,
  currency = brand.currency,
  className,
}: {
  amount: number;
  currency?: string;
  className?: string;
}) {
  if (currency !== "SAR") {
    return <span className={className}>{formatCurrency(amount, currency)}</span>;
  }

  return (
    <span className={cn("inline-flex items-baseline gap-[0.18em]", className)}>
      <span className="sr-only">{formatCurrency(amount, currency)}</span>
      <span aria-hidden="true" className="inline-flex items-baseline gap-[0.18em]">
        <RiyalSymbol />
        {formatAmount(amount)}
      </span>
    </span>
  );
}
