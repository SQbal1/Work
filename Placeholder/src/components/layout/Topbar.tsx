"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";

function sectionTitle(pathname: string): string {
  if (pathname.startsWith("/invoices/new")) return "New invoice";
  const item = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );
  return item?.label ?? "Dashboard";
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname() ?? "";
  const { company } = useStore();

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

      <div className="lg:hidden">
        <Logo showName={false} />
      </div>

      <h1 className="hidden font-display text-lg font-medium tracking-[0.025em] text-bone lg:block">
        {sectionTitle(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-3">
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
