import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { controlClass, Field } from "./Field";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, required, className, id, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} required={required}>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fog">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          required={required}
          className={cn(
            controlClass,
            "h-11",
            leftIcon ? "pl-10" : null,
            error ? "border-mute-red/60 focus:border-mute-red focus:ring-mute-red/15" : null,
            className,
          )}
          {...props}
        />
      </div>
    </Field>
  );
});
