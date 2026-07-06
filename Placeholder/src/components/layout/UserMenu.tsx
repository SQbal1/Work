"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/cn";

/** Avatar chip in the topbar — opens a small menu with Settings + Sign out. */
export function UserMenu() {
  const router = useRouter();
  const toast = useToast();
  const { company, usingSupabase } = useStore();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      toast.error(error.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-hairline py-1 pl-1 pr-2.5 transition hover:border-graphite hover:bg-white/[0.03]"
      >
        <Avatar name={company.name || "You"} size="sm" />
        <span className="hidden max-w-[12rem] truncate text-sm font-medium text-cloud sm:block">
          {company.name || "Your company"}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-fog transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 animate-scale-in overflow-hidden rounded-xl border border-graphite bg-ink shadow-lift"
        >
          <div className="border-b border-hairline px-3.5 py-3">
            <p className="truncate text-sm font-medium text-bone">{company.name || "Your company"}</p>
            <p className="text-xs text-fog">{usingSupabase ? "Signed in" : "Exploring the demo"}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-cloud transition hover:bg-white/[0.05]"
            >
              <SettingsIcon className="h-4 w-4 text-fog" />
              Settings
            </Link>
            {usingSupabase ? (
              <button
                type="button"
                role="menuitem"
                onClick={onSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-cloud transition hover:bg-white/[0.05] disabled:opacity-60"
              >
                <LogOut className="h-4 w-4 text-fog" />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            ) : (
              <Link
                href="/signup"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-cloud transition hover:bg-white/[0.05]"
              >
                <LogOut className="h-4 w-4 rotate-180 text-fog" />
                Create a free account
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
