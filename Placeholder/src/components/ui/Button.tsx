import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * X-family buttons: full-pill silhouette, lime signal primary with a soft
 * glow on hover, glass secondary. Shared via buttonStyles so <Link> can wear
 * the same clothes.
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-signal font-semibold text-[#081100] hover:bg-[#b9ff75] hover:shadow-glow-soft active:bg-loop-green",
  secondary:
    "border border-graphite bg-white/[0.04] text-cloud backdrop-blur-sm hover:border-[rgba(226,233,244,0.3)] hover:bg-white/[0.07] hover:text-bone",
  ghost: "text-cloud hover:bg-white/[0.05] hover:text-bone",
  danger:
    "border border-mute-red/35 bg-mute-red/[0.06] text-mute-red hover:border-mute-red hover:bg-mute-red/15",
  subtle: "border border-signal/25 bg-signal/10 text-key-lime hover:bg-signal/[0.16]",
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
