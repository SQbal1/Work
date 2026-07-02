import { cn } from "@/lib/cn";

/**
 * The official Saudi Riyal currency symbol (SAMA, approved Feb 2025; Unicode
 * U+20C1). Rendered as inline currentColor SVG rather than the Unicode glyph
 * itself — font support for U+20C1 is still essentially nonexistent, so the
 * character renders as a blank box in most stacks. Path traced from SAMA's
 * published vector asset.
 */
export function RiyalSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1124.14 1256.39"
      fill="currentColor"
      aria-hidden="true"
      className={cn("inline-block h-[0.72em] w-auto shrink-0 align-[-0.03em]", className)}
    >
      <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
      <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
    </svg>
  );
}
