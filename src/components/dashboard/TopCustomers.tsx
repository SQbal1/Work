import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/format";
import type { TopCustomer } from "@/lib/metrics";
import type { Customer } from "@/types";

/** Ranked list of best customers by billed revenue, with proportional bars. */
export function TopCustomers({
  rows,
  getCustomer,
}: {
  rows: TopCustomer[];
  getCustomer: (id: string | null) => Customer | undefined;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-fog">No billed customers yet.</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.revenue));

  return (
    <ul className="space-y-4">
      {rows.map((row) => {
        const customer = getCustomer(row.customerId);
        const name = customer?.company || customer?.name || "Unknown customer";
        const pct = Math.max(6, Math.round((row.revenue / max) * 100));
        return (
          <li key={row.customerId}>
            <div className="flex items-center gap-3">
              <Avatar name={name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href="/customers"
                    className="truncate text-sm font-medium text-cloud hover:text-bone"
                  >
                    {name}
                  </Link>
                  <span className="shrink-0 font-mono text-sm font-medium text-bone nums-tabular">
                    {formatCurrency(row.revenue)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink">
                    <div className="h-full rounded-full bg-signal/70" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-fog">
                    {row.count} {row.count === 1 ? "invoice" : "invoices"}
                  </span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
