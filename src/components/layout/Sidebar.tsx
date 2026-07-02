"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { Logo } from "@/components/Logo";
import { buttonStyles } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { getBusinessType } from "@/data/businessTypes";
import { cn } from "@/lib/cn";

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const { company } = useStore();
  const businessType = getBusinessType(company.businessType);

  return (
    <aside className={cn("no-print flex-col border-r border-hairline bg-ink", className)}>
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

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
              className={cn(
                "group flex items-center gap-3 rounded-[4px] border px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "border-signal/20 bg-canvas text-bone"
                  : "border-transparent text-fog hover:border-hairline hover:bg-canvas/70 hover:text-cloud",
              )}
            >
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

      <div className="p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-[4px] border border-hairline p-3 transition hover:border-graphite hover:bg-canvas/70"
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
            className="h-4 w-4 shrink-0 text-fog transition group-hover:text-cloud"
          />
        </Link>
      </div>
    </aside>
  );
}
