import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[4px] font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-signal text-ink hover:bg-key-lime active:bg-loop-green",
  secondary:
    "border border-hairline bg-ink text-cloud hover:border-graphite hover:bg-white/[0.03] hover:text-bone",
  ghost: "text-cloud hover:bg-white/[0.03] hover:text-bone",
  danger: "border border-mute-red/35 bg-ink text-mute-red hover:border-mute-red hover:bg-mute-red/10",
  subtle: "border border-signal/20 bg-signal/10 text-key-lime hover:bg-signal/15",
};

/** Shared class string so <Link> can look like a button too. */
export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, sizes[size], variants[variant], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  return <button ref={ref} className={buttonStyles(variant, size, className)} {...props} />;
});
