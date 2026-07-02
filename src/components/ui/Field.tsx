import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared control styling for inputs/selects/textareas. */
export const controlClass =
  "w-full rounded-[4px] border border-hairline bg-ink px-3.5 text-sm text-bone placeholder:text-fog transition [color-scheme:dark] focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/15 disabled:bg-canvas disabled:text-fog";

/** Label + hint/error wrapper used by all form controls. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  required,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-cloud">
          {label}
          {required ? <span className="text-signal"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-mute-red">{error}</p>
      ) : hint ? (
        <p className="text-xs text-fog">{hint}</p>
      ) : null}
    </div>
  );
}
