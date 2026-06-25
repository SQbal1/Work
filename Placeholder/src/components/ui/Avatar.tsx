import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

type AvatarSize = "sm" | "md" | "lg";
const sizeClass: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: AvatarSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full border border-hairline bg-ink font-mono font-semibold text-signal",
        sizeClass[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
