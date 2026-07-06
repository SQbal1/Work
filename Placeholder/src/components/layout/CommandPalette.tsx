"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  Plus,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

interface Command {
  id: string;
  group: string;
  label: string;
  sub?: string;
  icon: LucideIcon;
  run: () => void;
}

/** Fires from the Topbar trigger button so it and the hotkey share one palette. */
export const OPEN_EVENT = "placeholder:open-command-palette";

/**
 * Global command palette (⌘K / Ctrl+K). Jump to any screen, start a new
 * invoice, or search across invoices, customers and products. Also: "/" focuses
 * the current page's search box when you're not already typing in a field.
 */
export function CommandPalette() {
  const router = useRouter();
  const { customers, products, invoices } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkeys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      if (e.key === "/" && !open) {
        const el = document.activeElement;
        const tag = (el?.tagName ?? "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        const search = document.querySelector<HTMLInputElement>('input[aria-label^="Search"]');
        if (search) {
          e.preventDefault();
          search.focus();
        }
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    document.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [open]);

  // Reset + focus + scroll-lock on open.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const q = query.trim().toLowerCase();

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "new-invoice", group: "Actions", label: "New invoice", icon: Plus, run: () => go("/invoices/new") },
      { id: "go-dashboard", group: "Go to", label: "Dashboard", icon: LayoutDashboard, run: () => go("/dashboard") },
      { id: "go-invoices", group: "Go to", label: "Invoices", icon: FileText, run: () => go("/invoices") },
      { id: "go-customers", group: "Go to", label: "Customers", icon: Users, run: () => go("/customers") },
      { id: "go-products", group: "Go to", label: "Products & Services", icon: Package, run: () => go("/products") },
      { id: "go-settings", group: "Go to", label: "Settings", icon: Settings, run: () => go("/settings") },
    ];
    const filteredNav = q ? nav.filter((c) => c.label.toLowerCase().includes(q)) : nav;
    if (!q) return filteredNav;

    const entities: Command[] = [];
    for (const inv of invoices) {
      const c = customers.find((x) => x.id === inv.customerId);
      const hay = [inv.number, c?.company, c?.name].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(q)) {
        entities.push({
          id: `inv-${inv.id}`,
          group: "Invoices",
          label: inv.number,
          sub: c?.company || c?.name || "—",
          icon: FileText,
          run: () => go(`/invoices/${inv.id}`),
        });
      }
      if (entities.length >= 6) break;
    }
    for (const c of customers) {
      const hay = [c.company, c.name, c.email].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(q)) {
        entities.push({
          id: `cus-${c.id}`,
          group: "Customers",
          label: c.company || c.name,
          sub: c.email || undefined,
          icon: Users,
          run: () => go("/customers"),
        });
      }
    }
    for (const p of products) {
      if ([p.name, p.description].join(" ").toLowerCase().includes(q)) {
        entities.push({
          id: `prd-${p.id}`,
          group: "Products",
          label: p.name,
          sub: formatCurrency(p.unitPrice),
          icon: Package,
          run: () => go("/products"),
        });
      }
    }
    return [...filteredNav, ...entities.slice(0, 8)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, invoices, customers, products]);

  // Clamp the highlighted row whenever the result set shrinks.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, commands.length - 1)));
  }, [commands.length]);

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(commands.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commands[activeIndex]?.run();
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
            <motion.div
              className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              className="relative z-10 w-full max-w-xl overflow-hidden rounded-[12px] border border-graphite bg-canvas shadow-2xl"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.68 }}
            >
              <div className="flex items-center gap-3 border-b border-hairline px-4">
                <Search className="h-4 w-4 shrink-0 text-fog" />
                <input
                  ref={inputRef}
                  aria-label="Command palette search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Search or jump to…"
                  className="h-12 w-full bg-transparent text-sm text-bone placeholder:text-fog focus:outline-none"
                />
                <kbd className="hidden shrink-0 rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-fog sm:block">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[52vh] overflow-y-auto py-2 scrollbar-slim">
                {commands.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-fog">No matches for “{query}”.</p>
                ) : (
                  commands.map((c, i) => {
                    const showGroup = i === 0 || commands[i - 1].group !== c.group;
                    const Icon = c.icon;
                    const active = i === activeIndex;
                    return (
                      <div key={c.id}>
                        {showGroup ? (
                          <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-fog">
                            {c.group}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onMouseMove={() => setActiveIndex(i)}
                          onClick={() => c.run()}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition",
                            active ? "bg-signal/10 text-bone" : "text-cloud hover:bg-white/[0.03]",
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", active ? "text-signal" : "text-fog")} />
                          <span className="flex-1 truncate">{c.label}</span>
                          {c.sub ? <span className="truncate text-xs text-fog">{c.sub}</span> : null}
                          {active ? <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-fog" /> : null}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
