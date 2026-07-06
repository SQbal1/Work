import type { CSSProperties } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { XName } from "@/components/XName";
import { brand, whatsappLink } from "@/config/brand";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

// Footer links to the primary contact directly for a one-tap reach;
// the full list lives on /contact.
const primaryContact = brand.whatsappContacts[0];
const wa = primaryContact ? whatsappLink(primaryContact.number) : null;

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Demo", href: "/demo" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Request pilot access", href: "/pricing#request" },
      { label: "Contact", href: "/contact" },
      // Only appears once a WhatsApp number is configured in brand.ts.
      ...(wa ? [{ label: "WhatsApp", href: wa, external: true }] : []),
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "VAT & compliance", href: "/compliance" },
    ],
  },
];

/**
 * The Invoice X signature motif: a chain of linked blocks — every signed
 * invoice carries the hash of the one before it (ICV/PIH). Same role the
 * route ring→pin plays for RideX.
 */
function HashChainDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-0 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span
            className={
              i === 4
                ? "grid h-5 w-5 place-items-center rounded-[6px] border border-signal/60 bg-signal/15"
                : "grid h-5 w-5 place-items-center rounded-[6px] border border-hairline bg-white/[0.03]"
            }
          >
            <span
              className={
                i === 4 ? "h-1.5 w-1.5 rounded-[2px] bg-signal" : "h-1.5 w-1.5 rounded-[2px] bg-fog/60"
              }
            />
          </span>
          {i < 4 ? <span className="h-px w-8 bg-hairline sm:w-12" /> : null}
        </span>
      ))}
      <span className="ml-4 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-fog sm:block">
        every invoice chained to the last
      </span>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-canvas text-cloud">
      {/* faint mint bloom, bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(62,230,160,0.06),transparent_65%)] blur-2xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo href="/" light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fog">
              {brand.shortTagline} Built for SMEs and micro-businesses in {brand.country} and the GCC.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-fog">
              Part of the X family · <span className="text-ash">PayX</span> ·{" "}
              <span className="text-ash">RideX</span>
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ash">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) =>
                  l.external ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-fog transition hover:text-bone"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-fog transition hover:text-bone">
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-hairline pt-8">
          <HashChainDivider />
        </div>

        {/* Oversized sign-off wordmark — the family signature. Each letter
            hops in a staggered wave (see .footer-wordmark__letter), the
            Invoice X take on RideX's footer sign-off. */}
        <div className="pointer-events-none mt-10 select-none" aria-hidden="true">
          <div className="font-display text-[clamp(3.4rem,12vw,9rem)] font-semibold leading-none tracking-tight text-white/[0.05]">
            {"Invoice".split("").map((ch, i) => (
              <span key={i} className="footer-wordmark__letter" style={{ "--i": i } as CSSProperties}>
                {ch}
              </span>
            ))}
            <span
              className="footer-wordmark__letter text-gradient-x opacity-60"
              style={{ "--i": 7 } as CSSProperties}
            >
              X
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6 text-xs text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} <XName name={brand.name} />. Prototype for demonstration,
            not for production billing.
          </p>
          <p>MVP prototype · ZATCA-ready workflow foundation · Final compliance review required.</p>
        </div>
      </div>
    </footer>
  );
}
