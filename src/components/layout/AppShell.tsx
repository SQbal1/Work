"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { DashboardSkeleton, ListSkeleton } from "@/components/ui/Skeleton";
import { useStore } from "@/lib/store";

/** The authenticated app frame: fixed sidebar (desktop), drawer (mobile), topbar. */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { ready } = useStore();
  const pathname = usePathname() ?? "";
  const isDashboard = pathname === "/dashboard" || pathname === "/";

  // Lock body scroll while the mobile drawer is open (matches Modal behaviour).
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close the drawer when the route changes (belt-and-braces with onNavigate).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas text-bone">
      {/* Desktop sidebar */}
      <Sidebar className="hidden w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:flex" />

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <Sidebar
            className="absolute inset-y-0 left-0 flex w-72 animate-fade-in"
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      ) : null}

      <div className="lg:pl-64">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {ready ? children : isDashboard ? <DashboardSkeleton /> : <ListSkeleton />}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
