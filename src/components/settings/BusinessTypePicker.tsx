import { BUSINESS_TYPES } from "@/data/businessTypes";
import type { BusinessTypeId } from "@/types";
import { cn } from "@/lib/cn";

/** Selectable grid of business types. Reused by Settings and Onboarding. */
export function BusinessTypePicker({
  value,
  onChange,
}: {
  value: BusinessTypeId;
  onChange: (id: BusinessTypeId) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {BUSINESS_TYPES.map((b) => {
        const Icon = b.icon;
        const active = value === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            className={cn(
              "flex items-start gap-3 rounded-[4px] border p-4 text-left transition",
              active
                ? "border-signal/40 bg-signal/10"
                : "border-hairline bg-ink hover:border-graphite",
            )}
            aria-pressed={active}
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-[4px] border",
                active ? "border-signal/30 bg-signal text-ink" : "border-hairline bg-canvas text-fog",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-bone">{b.label}</span>
              <span className="block text-xs text-fog">{b.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
