/**
 * Central brand configuration.
 *
 * 🔁 To rename the product later, change `name` here. Every screen reads from
 * this file (nav, footer, invoices, auth, onboarding, settings), so a single
 * edit re-brands the whole app. Invoice X is part of the X family of products
 * (PayX, RideX) — the trailing "X" renders in the brand gradient (see Logo).
 */
export const brand = {
  name: "Invoice X",
  tagline: "Create invoices, track payments, and manage customers, without the accounting confusion.",
  shortTagline: "Invoicing without the accounting headache.",
  // Default region / compliance context (KSA).
  country: "Saudi Arabia",
  currency: "SAR",
  vatRate: 0.15, // Standard KSA VAT rate (15%).
  // Personal inbox used for the pilot while invoicex.sa is not a live domain.
  // Every mailto fallback (contact, form error, footer) reads from here.
  supportEmail: "salimsardar42131@gmail.com",
  // WhatsApp contacts (Gulf-standard channel). Numbers in international format
  // WITHOUT the leading "+" or spaces, e.g. "966512345678". An empty array hides
  // every WhatsApp affordance site-wide. During the internal pilot these are the
  // Invoice X team's own lines — swap for a business number before public launch.
  whatsappContacts: [
    { name: "Salem", number: "966545277079" },
    { name: "Ali", number: "966569342309" },
  ] as ReadonlyArray<{ name: string; number: string }>,
  // Marketing convenience links (kept as placeholders for the MVP).
  domain: "invoicex.sa",
  // Canonical public origin (used for metadata, OG, robots, sitemap).
  // Override per-environment with NEXT_PUBLIC_SITE_URL.
  url: "https://invoicex.sa",
} as const;

export type Brand = typeof brand;

/** wa.me deep link for a number, optionally pre-filled with a message. */
export function whatsappLink(number: string, message?: string): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Human-readable number, KSA-formatted when possible (e.g. "+966 54 527 7079"). */
export function whatsappDisplay(number: string): string {
  if (number.startsWith("966") && number.length === 12) {
    const r = number.slice(3);
    return `+966 ${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5)}`;
  }
  return `+${number}`;
}
