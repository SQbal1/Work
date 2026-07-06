"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/data/marketing";
import { cn } from "@/lib/cn";

export function Faq({ className }: { className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div
      className={cn(
        "divide-y divide-hairline overflow-hidden rounded-[10px] border border-hairline bg-canvas",
        className ?? "mx-auto max-w-3xl",
      )}
    >
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-bone">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-fog transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen ? (
              <div className="px-5 pb-5 text-sm leading-relaxed text-fog animate-fade-in">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
