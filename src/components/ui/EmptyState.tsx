import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-[4px] border border-dashed border-hairline bg-ink/55 px-6 py-14 text-center",
        className,
      )}
    >
      {/* Soft lime halo for a touch of depth. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-signal/10 blur-3xl"
      />
      {Icon ? (
        <span className="relative grid h-14 w-14 place-items-center rounded-full border border-signal/20 bg-signal/10 text-signal ring-8 ring-signal/[0.04]">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <h3 className="relative mt-4 font-display font-medium tracking-[0.025em] text-bone">{title}</h3>
      {description ? <p className="relative mt-1 max-w-sm text-sm text-fog">{description}</p> : null}
      {action ? <div className="relative mt-5">{action}</div> : null}
    </div>
  );
}
