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
        "flex flex-col items-center justify-center rounded-[4px] border border-dashed border-hairline bg-ink/55 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="grid h-12 w-12 place-items-center rounded-[4px] border border-signal/20 bg-signal/10 text-signal">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <h3 className="mt-4 font-display font-medium tracking-[0.025em] text-bone">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-fog">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
