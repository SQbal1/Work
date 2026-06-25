import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/cn";

/** Shared date stamp for all legal/contact pages. Update when policies change. */
export const LEGAL_LAST_UPDATED = "25 June 2026";

/**
 * Shared chrome + typography for the legal/contact pages (privacy, terms,
 * compliance, contact). Keeps the dark + lime marketing language without a
 * prose plugin — each page just composes the helpers below.
 */
export function LegalLayout({
  eyebrow,
  title,
  intro,
  lastUpdated = LEGAL_LAST_UPDATED,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  lastUpdated?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas text-bone">
      <MarketingNav />

      <section className="border-b border-hairline py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-fog transition hover:text-bone"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back home
            </Link>
            <div className="mt-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <span className="text-signal">{eyebrow}</span>
            </div>
            <h1 className="mt-4 text-balance font-display text-4xl font-medium tracking-[0.025em] text-bone sm:text-5xl">
              {title}
            </h1>
            {intro ? (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-fog">{intro}</p>
            ) : null}
            {lastUpdated ? (
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ash">
                Last updated · {lastUpdated}
              </p>
            ) : null}
          </Reveal>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-7">{children}</div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

/** A titled content block — optionally numbered heading + body. */
export function LegalSection({
  heading,
  number,
  children,
  className,
}: {
  heading: string;
  number?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("border-t border-hairline pt-7", className)}>
      {number ? (
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
          {number}
        </div>
      ) : null}
      <h2 className="text-balance font-display text-xl font-medium tracking-[0.025em] text-bone sm:text-2xl">
        {heading}
      </h2>
      <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-fog">{children}</div>
    </Reveal>
  );
}

/** Bulleted list with the lime tick rhythm used across the site. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-cloud">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
