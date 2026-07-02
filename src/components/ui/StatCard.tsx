import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/types";
import { Card } from "./Card";
import { Sparkline } from "./Sparkline";

const iconTone: Record<Tone, string> = {
  gray: "border-hairline bg-ink text-fog",
  green: "border-signal/20 bg-signal/10 text-signal",
  amber: "border-key-lime/20 bg-key-lime/10 text-key-lime",
  red: "border-mute-red/25 bg-mute-red/10 text-mute-red",
  blue: "border-syntax-violet/25 bg-syntax-violet/10 text-syntax-violet",
  violet: "border-tag-magenta/25 bg-tag-magenta/10 text-tag-magenta",
};

const sparkStroke: Partial<Record<Tone, string>> = {
  green: "var(--color-signal-lime)",
  amber: "var(--color-key-lime)",
  red: "var(--color-mute-red)",
  blue: "var(--color-syntax-violet)",
  violet: "var(--color-tag-magenta)",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "violet",
  hint,
  delta,
  spark,
  href,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: ReactNode;
  /** Period-over-period change as a %. Positive = green/up, negative = red/down. */
  delta?: number | null;
  /** Optional mini sparkline series. */
  spark?: number[];
  /** When set, the whole card becomes a link (e.g. Overdue → filtered list). */
  href?: string;
}) {
  const up = typeof delta === "number" && delta >= 0;
  const card = (
    <Card
      className={cn(
        "relative h-full overflow-hidden p-5",
        href && "transition hover:border-graphite hover:bg-white/[0.02]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-fog">{label}</span>
        {Icon ? (
          <span className={cn("grid h-9 w-9 place-items-center rounded-[4px] border", iconTone[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>

      {/* Big number + sparkline share one row; the delta gets its own line
          below so its label never collides with the sparkline. */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0 font-mono text-2xl font-semibold tracking-tight text-bone nums-tabular">
          {value}
        </div>
        {spark && spark.length > 1 ? (
          <div className="h-7 w-16 shrink-0 sm:w-24">
            <Sparkline
              data={spark}
              stroke={sparkStroke[tone] ?? "var(--color-fog-text)"}
              className="h-full w-full opacity-90"
            />
          </div>
        ) : null}
      </div>

      {hint ? <div className="mt-2 text-xs text-fog">{hint}</div> : null}

      {typeof delta === "number" ? (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            up ? "text-signal" : "text-mute-red",
          )}
        >
          {up ? (
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="nums-tabular">{Math.abs(delta)}%</span>
          <span className="truncate text-fog">vs last month</span>
        </div>
      ) : null}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-[4px] focus-ring">
        {card}
      </Link>
    );
  }
  return card;
}
