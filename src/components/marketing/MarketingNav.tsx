"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/features", label: "Features" },
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close drawer on resize to desktop so it doesn't linger hidden behind the nav.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  // Prevent body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Let the bar settle (gain a shadow) once the page moves — a quiet depth cue.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-canvas/95 backdrop-blur-[6px] transition-[box-shadow,background-color,border-color] duration-300",
          scrolled
            ? "border-hairline bg-canvas/98 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]"
            : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  className={cn(
                    "relative rounded-[2px] text-sm font-medium transition-colors focus-ring",
                    active ? "text-bone" : "text-cloud hover:text-bone",
                  )}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  key={link.href}
                >
                  {link.label}
                  {/* active underline — a quiet wayfinding cue */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-px bg-signal transition-all duration-300",
                      active ? "w-full opacity-100" : "w-0 opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop sign-in */}
            <div className="hidden rounded-[4px] sm:block">
              <Link
                className="block rounded-[4px] px-3 py-2 text-sm font-medium text-cloud transition-colors hover:text-bone focus-ring"
                href="/login"
              >
                Sign in
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden rounded-[4px] md:block">
              <Link className={buttonStyles("primary", "sm", "transition-none hover:bg-signal")} href="/pricing">
                Get started
              </Link>
            </div>

            {/* Mobile hamburger — visible only below md */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-[4px] border border-hairline bg-ink text-cloud transition-colors hover:border-graphite hover:text-bone focus-ring md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — slides down from the header edge */}
      <AnimatePresence>
        {open ? (
          <>
            {/* Backdrop */}
            <motion.div
              key="nav-backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 bg-ink/60 backdrop-blur-[2px] md:hidden"
            />

            {/* Panel */}
            <motion.div
              key="nav-panel"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 top-16 z-40 border-b border-hairline bg-canvas/98 px-4 pb-6 pt-4 backdrop-blur-[8px] md:hidden"
            >
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-[4px] px-3 py-3 text-sm font-medium transition-colors focus-ring",
                        active ? "bg-ink text-bone" : "text-cloud hover:bg-ink hover:text-bone",
                      )}
                    >
                      {link.label}
                      {active ? <span className="h-1.5 w-1.5 rounded-full bg-signal" /> : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={buttonStyles("secondary", "md", "w-full")}
                >
                  Sign in
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className={buttonStyles("primary", "md", "w-full")}
                >
                  Get started
                </Link>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
