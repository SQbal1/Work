import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline bg-ink text-cloud shadow-card transition-colors hover:border-graphite",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
  bordered = true,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Divider rule under the header. Off for dashboard cards (less form-like). */
  bordered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 py-4 sm:px-6",
        bordered && "border-b border-hairline",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="font-display font-semibold tracking-tight text-bone">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-fog">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
