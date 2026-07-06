"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getEffectiveStatus } from "@/lib/status";
import { cn } from "@/lib/cn";
import type { Invoice } from "@/types";

const LAST_SEEN_KEY = "placeholder_last_seen";
const WEEK_MS = 7 * 86_400_000;

/**
 * A slim "what changed since you last looked" strip. Reads a last-visit
 * timestamp from localStorage (falling back to a 7-day window on first visit),
 * then stamps the current visit for next time. Hidden when nothing happened.
 */
export function ActivityStrip({ invoices }: { invoices: Invoice[] }) {
  const [sinceMs, setSinceMs] = useState<number | null>(null);
  const [firstVisit, setFirstVisit] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(LAST_SEEN_KEY);
    const prev = raw ? Number(raw) : NaN;
    const hasPrev = Number.isFinite(prev);
    setFirstVisit(!hasPrev);
    setSinceMs(hasPrev ? prev : Date.now() - WEEK_MS);
    window.localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  }, []);

  if (sinceMs === null) return null;

  const after = (iso?: string | null) => (iso ? new Date(iso).getTime() > sinceMs : false);
  const created = invoices.filter((i) => after(i.createdAt)).length;
  const paid = invoices.filter((i) => i.status === "paid" && after(i.paidDate || i.updatedAt)).length;
  const overdue = invoices.filter((i) => getEffectiveStatus(i) === "overdue").length;

  if (created === 0 && paid === 0 && overdue === 0) return null;

  return (
    <div className="mt-6 flex animate-fade-in flex-wrap items-center gap-x-5 gap-y-2 rounded-[10px] border border-hairline bg-ink/60 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 font-medium text-cloud">
        <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
        {firstVisit ? "In the last 7 days" : "Since your last visit"}
      </span>
      {created > 0 ? <Item dot="bg-tag-magenta" text={`${created} ${created === 1 ? "invoice" : "invoices"} created`} /> : null}
      {paid > 0 ? <Item dot="bg-signal" text={`${paid} paid`} /> : null}
      {overdue > 0 ? (
        <Link
          href="/invoices?status=overdue"
          className="inline-flex items-center gap-1.5 font-medium text-mute-red transition hover:text-mute-red/80"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-mute-red" />
          {overdue} overdue <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function Item({ dot, text }: { dot: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-cloud">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {text}
    </span>
  );
}
