import Link from "next/link";
import { cn } from "@/lib/cn";
import { brand } from "@/config/brand";
import { XName } from "@/components/XName";

/**
 * Brand mark + wordmark. The mark is a dark tile carrying the gradient X;
 * the wordmark renders via XName so the trailing X always wears the brand
 * gradient (X-family convention). Renaming in src/config/brand.ts re-brands
 * everywhere.
 */
export function Logo({
  href = "/",
  showName = true,
  light = false,
  className,
}: {
  href?: string | null;
  showName?: boolean;
  light?: boolean;
  className?: string;
}) {
  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-graphite bg-ink shadow-[0_1px_0_rgba(244,246,249,0.06)_inset]">
        {/* soft signal bloom behind the glyph */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_80%_at_30%_20%,rgba(168,255,83,0.16),transparent_70%)]"
        />
        <svg viewBox="0 0 24 24" className="relative h-[15px] w-[15px]" aria-hidden="true">
          <defs>
            <linearGradient id="ix-x" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9f07c" />
              <stop offset="45%" stopColor="#a8ff53" />
              <stop offset="100%" stopColor="#3ee6a0" />
            </linearGradient>
          </defs>
          <path
            d="M4 3.5 L10.4 12 L4 20.5 H8.1 L12.4 14.7 L16.7 20.5 H20.8 L14.4 12 L20.8 3.5 H16.7 L12.4 9.3 L8.1 3.5 Z"
            fill="url(#ix-x)"
          />
        </svg>
      </span>
      {showName ? (
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight",
            light ? "text-bone" : "text-bone",
          )}
        >
          <XName name={brand.name} />
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
