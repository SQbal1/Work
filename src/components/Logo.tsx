import Link from "next/link";
import { cn } from "@/lib/cn";
import { brand } from "@/config/brand";

/**
 * Brand mark + wordmark. The letter is derived from `brand.name`, so renaming
 * the product in `src/config/brand.ts` updates the logo everywhere.
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-[4px] border border-hairline bg-ink">
        <span className="h-2.5 w-2.5 rounded-[2px] bg-signal" />
      </span>
      {showName ? (
        <span
          className={cn(
            "font-display text-lg font-medium tracking-[0.025em]",
            light ? "text-bone" : "text-bone",
          )}
        >
          {brand.name}
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
