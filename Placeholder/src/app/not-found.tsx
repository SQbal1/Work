import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { buttonStyles } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: true },
};

const quickLinks = [
  { href: "/features", label: "Features" },
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="bg-canvas text-bone">
      <MarketingNav />

      <section className="aurora hero-motion-grid relative flex min-h-[calc(100svh-4rem)] items-center border-b border-hairline">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
              <span className="signal-pulse h-2 w-2 rounded-full bg-signal" />
              <span className="text-fog">error</span>
              <span className="h-px w-6 bg-graphite" />
              <span className="text-signal">not_found</span>
            </div>

            <h1 className="nums-tabular mt-7 font-display text-7xl font-medium leading-none tracking-[0.04em] text-bone sm:text-8xl">
              404
            </h1>

            <h2 className="mt-6 text-balance font-display text-2xl font-medium tracking-[0.025em] text-bone sm:text-3xl">
              We couldn&apos;t find that page
            </h2>
            <p className="mx-auto mt-4 max-w-md text-balance text-base leading-relaxed text-fog">
              The route may have moved, or the link was mistyped. Here&apos;s the way back.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/" className={buttonStyles("primary", "lg")}>
                <Home className="h-4 w-4" /> Back home
              </Link>
              <Link href="/features" className={buttonStyles("secondary", "lg")}>
                View features <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
              {quickLinks.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-[2px] transition hover:text-bone focus-ring">
                  {l.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
