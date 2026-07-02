"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { Avatar } from "@/components/ui/Avatar";
import { OPEN_EVENT } from "./CommandPalette";
import { useStore } from "@/lib/store";

function sectionTitle(pathname: string): string {
  if (pathname.startsWith("/invoices/new")) return "New invoice";
  if (pathname.startsWith("/settings")) return "Settings";
  const item = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );
  return item?.label ?? "Dashboard";
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname() ?? "";
  const { company } = useStore();
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent));
  }, []);

  const openPalette = () => document.dispatchEvent(new CustomEvent(OPEN_EVENT));

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        className="grid h-10 w-10 place-items-center rounded-[4px] text-fog transition hover:bg-white/[0.03] hover:text-bone lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="truncate font-display text-lg font-medium tracking-[0.025em] text-bone">
        {sectionTitle(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={openPalette}
          aria-label="Open command palette"
          className="hidden items-center gap-2 rounded-[4px] border border-hairline bg-ink px-2.5 py-1.5 text-sm text-fog transition hover:border-graphite hover:text-cloud sm:flex"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search…</span>
          <kbd className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-fog">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
        <Link
          href="/"
          className="hidden text-sm font-medium text-fog transition hover:text-bone sm:block"
        >
          View site
        </Link>
        <span className="flex items-center gap-2 rounded-full border border-hairline py-1 pl-1 pr-3">
          <Avatar name={company.name || "You"} size="sm" />
          <span className="hidden max-w-[12rem] truncate text-sm font-medium text-cloud sm:block">
            {company.name || "Your company"}
          </span>
        </span>
      </div>
    </header>
  );
}
