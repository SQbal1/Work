import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/types";
import { Card } from "./Card";

const iconTone: Record<Tone, string> = {
  gray: "border-hairline bg-ink text-fog",
  green: "border-signal/20 bg-signal/10 text-signal",
  amber: "border-key-lime/20 bg-key-lime/10 text-key-lime",
  red: "border-mute-red/25 bg-mute-red/10 text-mute-red",
  blue: "border-syntax-violet/25 bg-syntax-violet/10 text-syntax-violet",
  violet: "border-tag-magenta/25 bg-tag-magenta/10 text-tag-magenta",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "violet",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-fog">{label}</span>
        {Icon ? (
          <span className={cn("grid h-9 w-9 place-items-center rounded-[4px] border", iconTone[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-3 font-mono text-2xl font-semibold tracking-tight text-bone">{value}</div>
      {hint ? <div className="mt-1 text-xs text-fog">{hint}</div> : null}
    </Card>
  );
}
