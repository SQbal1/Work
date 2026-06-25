import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { brand } from "@/config/brand";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

/**
 * Guided "is this invoice ready?" checklist. Intentionally framed as guidance —
 * see the placeholder compliance note. Not a claim of legal ZATCA compliance.
 */
export function CompletenessChecklist({ items }: { items: ChecklistItem[] }) {
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-cloud">
          {done} of {items.length} complete
        </span>
        <span className="font-mono text-sm font-semibold text-signal">{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink">
        <div
          className="h-full rounded-full bg-signal transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2.5 font-mono text-sm">
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                it.done ? "bg-signal text-ink" : "border border-hairline text-transparent",
              )}
            >
              <Check className="h-3 w-3" />
            </span>
            <span className={it.done ? "text-cloud" : "text-fog"}>{it.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-start gap-2 rounded-[4px] border border-key-lime/20 bg-key-lime/10 p-3 text-xs text-key-lime">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-key-lime" />
        <p>
          Compliance checklist placeholder. {brand.name} provides a ZATCA-ready workflow foundation — a
          final compliance review is required before production use.
        </p>
      </div>
    </div>
  );
}
