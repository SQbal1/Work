import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/types";

const toneClass: Record<Tone, string> = {
  gray: "bg-ink text-ash ring-hairline",
  green: "bg-signal/10 text-loop-green ring-signal/20",
  amber: "bg-key-lime/10 text-key-lime ring-key-lime/20",
  red: "bg-mute-red/10 text-mute-red ring-mute-red/25",
  blue: "bg-syntax-violet/10 text-syntax-violet ring-syntax-violet/25",
  violet: "bg-tag-magenta/10 text-tag-magenta ring-tag-magenta/25",
};

const dotClass: Record<Tone, string> = {
  gray: "bg-fog",
  green: "bg-signal",
  amber: "bg-key-lime",
  red: "bg-mute-red",
  blue: "bg-syntax-violet",
  violet: "bg-tag-magenta",
};

export function Badge({
  tone = "gray",
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-normal uppercase tracking-[0.02em] ring-1 ring-inset",
        toneClass[tone],
        className,
      )}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dotClass[tone])} /> : null}
      {children}
    </span>
  );
}
