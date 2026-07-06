"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings, ChevronLeft } from "lucide-react";
import { NAV_ITEMS, SETTINGS_SECTIONS } from "@/config/nav";
import { Logo } from "@/components/Logo";
import { buttonStyles } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { getBusinessType } from "@/data/businessTypes";
import { cn } from "@/lib/cn";

/** Scroll-spy: which of the given section ids is currently near the top. */
function useActiveSection(ids: string[], enabled: boolean, ready: boolean): string {
  const [active, setActive] = useState("");
  // ids is rebuilt each render; the joined key is the stable dep.
  const idsKey = ids.join("|");
  useEffect(() => {
    const list = idsKey ? idsKey.split("|") : [];
    if (!enabled || !ready || list.length === 0) return;
    const els = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled, ready, idsKey]);
  return active;
}

const railClass =
  "group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition";
const activeRail =
  "border-signal/20 bg-white/[0.05] text-bone";
const idleRail =
  "border-transparent text-fog hover:border-hairline hover:bg-white/[0.03] hover:text-cloud";

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const { company, usingSupabase, ready } = useStore();
  const businessType = getBusinessType(company.businessType);

  const inSettings = pathname.startsWith("/settings");
  const sections = SETTINGS_SECTIONS.filter((s) => !s.authOnly || usingSupabase);
  const activeSection = useActiveSection(
    sections.map((s) => s.id),
    inSettings,
    ready,
  );

  return (
    <aside className={cn("no-print flex-col border-r border-hairline bg-ink", className)}>
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

      {inSettings ? (
        <>
          <div className="px-3">
            <Link
              href="/dashboard"
              onClick={onNavigate}
              className="group flex items-center gap-2 rounded-xl border border-hairline bg-white/[0.02] px-3 py-2.5 text-sm font-medium text-fog transition hover:border-graphite hover:bg-white/[0.04] hover:text-cloud"
            >
              <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              Back to app
            </Link>
          </div>

          <div className="mt-4 px-3 pb-1">
            <p className="px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-fog">Settings</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 scrollbar-slim">
            {sections.map((s) => {
              const active = activeSection === s.id;
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => {
                    const el = document.getElementById(s.id);
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.replaceState(null, "", `#${s.id}`);
                    }
                    onNavigate?.();
                  }}
                  className={cn(railClass, active ? activeRail : idleRail)}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-signal to-mint transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-signal" : "text-fog group-hover:text-cloud",
                    )}
                  />
                  {s.label}
                </a>
              );
            })}
          </nav>
        </>
      ) : (
        <>
          <div className="px-3">
            <Link
              href="/invoices/new"
              onClick={onNavigate}
              className={buttonStyles("primary", "md", "w-full")}
            >
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
          </div>

          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 scrollbar-slim">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(railClass, active ? activeRail : idleRail)}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-signal to-mint transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-signal" : "text-fog group-hover:text-cloud",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}

      <div className="p-3">
        {!ready ? (
          <div className="flex items-center gap-3 rounded-xl border border-hairline bg-white/[0.02] p-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-white/[0.05]" />
            </div>
          </div>
        ) : (
          <Link
            href="/settings"
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl border p-3 transition",
              inSettings
                ? "border-signal/20 bg-white/[0.05]"
                : "border-hairline bg-white/[0.02] hover:border-graphite hover:bg-white/[0.04]",
            )}
          >
            <Avatar name={company.name || "Your Company"} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-bone">
                {company.name || "Your company"}
              </p>
              <p className="truncate text-xs text-fog">{businessType.label}</p>
            </div>
            <Settings
              aria-hidden
              className={cn(
                "h-4 w-4 shrink-0 transition",
                inSettings ? "text-signal" : "text-fog group-hover:text-cloud",
              )}
            />
          </Link>
        )}
      </div>
    </aside>
  );
}
