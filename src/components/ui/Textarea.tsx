import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { controlClass, Field } from "./Field";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, id, rows = 3, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} required={required}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        className={cn(controlClass, "py-2.5 leading-relaxed", className)}
        {...props}
      />
    </Field>
  );
});
