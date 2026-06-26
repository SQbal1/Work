import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

/** Lightweight dependency-free bar chart for monthly revenue. */
export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex h-40 items-end gap-2 sm:gap-3">
        {data.map((d, i) => {
          const height = Math.max(4, Math.round((d.value / max) * 100));
          const last = i === data.length - 1;
          return (
            <div key={i} className="flex h-full flex-1 items-end" title={`${d.label}: ${formatCurrency(d.value)}`}>
              <div
                className={cn(
                  "w-full rounded-t-[4px] transition-all hover:opacity-90",
                  last
                    ? "bg-signal"
                    : "bg-graphite hover:bg-ash",
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center font-mono text-xs text-fog">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
