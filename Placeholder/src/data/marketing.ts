import {
  Users,
  Calculator,
  MessageSquare,
  UserPlus,
  FileText,
  Percent,
  CircleDollarSign,
  Database,
  RefreshCw,
  Wallet,
  Eye,
  FileDown,
  Briefcase,
  Wrench,
  Truck,
  MapPin,
  type LucideIcon,
} from "lucide-react";

/**
 * All marketing copy lives here so it's easy to edit without touching layout.
 * Scoped to the MVP public pages: homepage, /features, /pricing.
 */

export interface IconItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Homepage — Problem section (3 focused cards). */
export const PROBLEMS: IconItem[] = [
  {
    icon: Users,
    title: "Customer data scattered",
    description:
      "Small teams re-enter the same client details across invoices, chats, and spreadsheets — wasting time and inviting mistakes.",
  },
  {
    icon: Calculator,
    title: "VAT totals checked by hand",
    description:
      "Totals, VAT fields, and invoice readiness get verified by eye before sending, with no consistent place to confirm them.",
  },
  {
    icon: MessageSquare,
    title: "Payment status lives in WhatsApp & Excel",
    description:
      "Once an invoice goes out, who has paid and who is still open is tracked through messages and ad-hoc spreadsheets.",
  },
];

/** Homepage + features — the narrow MVP workflow. */
export const WORKFLOW: IconItem[] = [
  {
    icon: UserPlus,
    title: "Save customer record",
    description: "Store the client once. Reuse their details on every future invoice.",
  },
  {
    icon: FileText,
    title: "Generate invoice",
    description: "Build an invoice from saved records and service lines in seconds.",
  },
  {
    icon: Percent,
    title: "VAT-aware totals",
    description: "Subtotal, VAT, and grand total calculated as you go — no manual math.",
  },
  {
    icon: CircleDollarSign,
    title: "Track payment",
    description: "Watch each invoice move through Draft, Sent, Open, and Paid.",
  },
];

/** Homepage — Built for section (early target segments). */
export interface Segment {
  icon: LucideIcon;
  label: string;
  description: string;
}

export const BUILT_FOR: Segment[] = [
  {
    icon: Briefcase,
    label: "Consulting firms",
    description: "Advisory and agency teams billing clients by project or retainer.",
  },
  {
    icon: Wrench,
    label: "Service businesses",
    description: "Professional and owner-operated services that invoice every week.",
  },
  {
    icon: Truck,
    label: "Logistics SMEs",
    description: "Delivery, shipping, and transport teams managing recurring clients.",
  },
  {
    icon: MapPin,
    label: "Saudi / GCC small businesses",
    description: "Local teams that need VAT-aware invoicing without a heavy ERP.",
  },
];

/** Homepage — MVP feature grid. */
export const MVP_FEATURES: IconItem[] = [
  {
    icon: Database,
    title: "Customer database",
    description: "A single place for client names, VAT numbers, and contact details.",
  },
  {
    icon: RefreshCw,
    title: "Reusable customer records",
    description: "Pull a saved customer into any invoice — no repeated typing.",
  },
  {
    icon: FileText,
    title: "Invoice generation",
    description: "Create clean, structured invoices from records and service lines.",
  },
  {
    icon: Percent,
    title: "VAT-aware calculations",
    description: "Per-line VAT with accurate subtotals and totals for KSA's 15% rate.",
  },
  {
    icon: Wallet,
    title: "Payment status tracking",
    description: "Draft, Sent, Open, and Paid states so receivables stay visible.",
  },
  {
    icon: Eye,
    title: "Workflow visibility",
    description: "See where every invoice stands, from customer record to payment.",
  },
  {
    icon: FileDown,
    title: "PDF export placeholder",
    description: "Export is scaffolded as a placeholder — real generation comes after the pilot.",
  },
];

/** Pricing page — the one live offer (dominant card), written as outcomes. */
export const PILOT_OFFER = {
  name: "Pilot",
  price: "Free",
  period: "during the pilot",
  blurb: "For the first Saudi & GCC teams testing a cleaner invoice workflow.",
  outcomes: [
    "Save clients once and reuse them on every invoice",
    "Create VAT-aware invoices from saved customer records",
    "Review VAT readiness before you send",
    "Track Draft, Sent, Open, and Paid states in one place",
    "Get direct onboarding and feedback-based improvements",
  ],
} as const;

/** Pricing page — tiers planned after the pilot (not yet available). */
export interface FutureTier {
  name: string;
  blurb: string;
  features: string[];
}

export const FUTURE_TIERS: FutureTier[] = [
  {
    name: "Small Business",
    blurb: "More users, templates, and deeper workflow control.",
    features: ["Everything in Pilot", "Team members", "Advanced templates", "PDF export", "Reporting"],
  },
  {
    name: "Custom",
    blurb: "Hands-on setup and workflow adaptation for specific operations.",
    features: ["Setup guidance", "Workflow mapping", "Custom onboarding", "Priority feedback"],
  },
];

/** Pricing page — the manual onboarding path, after a pilot request. */
export const PILOT_NEXT_STEPS: string[] = [
  "Send your pilot request",
  "We review fit within 24 hours",
  "20-minute onboarding call",
  "Start with your first customer and invoice",
];

/** Pricing page — business types offered in the request form. */
export const BUSINESS_TYPES: string[] = [
  "Consulting / advisory",
  "Professional services",
  "Logistics / transport",
  "Trading / retail",
  "Other",
];

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Is Placeholder officially ZATCA compliant?",
    answer:
      "Not yet. Placeholder is an MVP with a ZATCA-ready workflow foundation and VAT readiness checks. It does not claim certified compliance — a final compliance review is required before production use.",
  },
  {
    question: "Do I need accounting knowledge to use it?",
    answer:
      "No. Placeholder is designed so anyone can create a clean, VAT-aware invoice without accounting jargon or spreadsheets.",
  },
  {
    question: "How does the pilot work?",
    answer:
      "Pilot access is onboarded manually with direct support. You get the core workflow — customer records, invoices, VAT-aware totals, and payment tracking — and a direct feedback loop to shape what we build next.",
  },
  {
    question: "How do payments work during the pilot?",
    answer:
      "There is no online checkout yet. Pilot pricing is handled manually through direct arrangement, so you can focus on testing the workflow.",
  },
  {
    question: "Which businesses is it for?",
    answer:
      "We're starting with service businesses — consulting firms, professional services, logistics SMEs, and small Saudi/GCC teams — and designing to expand into adjacent SME operations later.",
  },
];
