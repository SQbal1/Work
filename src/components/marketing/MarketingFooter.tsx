import Link from "next/link";
import { Logo } from "@/components/Logo";
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

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-ink text-cloud">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo href="/" light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fog">
              {brand.shortTagline} Built for SMEs and micro-businesses in {brand.country} and the GCC.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-bone">{col.title}</h4>
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

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 text-xs text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. Prototype for demonstration — not for production billing.
          </p>
          <p>MVP prototype · ZATCA-ready workflow foundation · Final compliance review required.</p>
        </div>
      </div>
    </footer>
  );
}
