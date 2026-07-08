/**
 * Core data model for Invoice X.
 *
 * Everything is intentionally simple and flat so it maps cleanly to a real
 * database later (each interface ≈ one table). Money is stored as plain numbers
 * in the major currency unit (e.g. 100.50 SAR), which is fine for an MVP.
 */

/** Business types the product can serve. The MVP leans on consulting/freelancer
 *  but the model supports the rest from day one. */
export type BusinessTypeId =
  | "consulting"
  | "logistics"
  | "retail"
  | "restaurant"
  | "construction"
  | "freelancer"
  | "other";

/** VAT treatment for a product/line item (KSA standard rate is 15%). */
export type VatCategory = "standard" | "zero" | "exempt";

/** Stored invoice status. "Overdue" is derived (see getEffectiveStatus), never stored. */
export type InvoiceStatus = "draft" | "sent" | "paid";

/** Status including the derived "overdue" state, used for filters/badges. */
export type EffectiveStatus = InvoiceStatus | "overdue";

/** The seller — a single company per workspace for this MVP. */
export interface Company {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  vatNumber: string; // placeholder, validated only for shape in the UI
  crNumber: string; // commercial registration number
  address: string;
  city: string;
  businessType: BusinessTypeId;
}

export interface Customer {
  id: string;
  name: string; // person or company name
  company: string;
  email: string;
  phone: string;
  vatNumber: string;
  address: string;
  notes: string;
  createdAt: string; // ISO timestamp
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  vatCategory: VatCategory;
  active: boolean;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  productId: string | null; // links to a Product, or null for a custom line
  name: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // e.g. 0.15, 0
}

export interface Invoice {
  id: string;
  number: string; // e.g. "INV-1006"
  customerId: string | null;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  discountPercent: number; // 0–100, applied to the subtotal
  notes: string;
  paidDate: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * ZATCA Phase-2 structural preview — set only once signed (Supabase
   * workspaces only, never present in local demo mode). See src/lib/zatca/.
   */
  zatcaIcv?: number | null;
  zatcaPreviousHash?: string | null;
  zatcaInvoiceHash?: string | null;
  zatcaSignature?: string | null;
  zatcaPublicKey?: string | null;
  zatcaSignedAt?: string | null;
}

/** How the printed invoice header renders. "letterhead" leaves blank space at the
 *  top/bottom of the page so the invoice can be printed onto pre-printed stationery. */
export type InvoiceHeaderMode = "standard" | "letterhead";

export interface Settings {
  invoicePrefix: string; // e.g. "INV-"
  nextInvoiceNumber: number; // e.g. 1006
  defaultVatRate: number; // e.g. 0.15
  defaultDueDays: number; // net terms in days
  defaultNotes: string;
  currency: string; // e.g. "SAR"
  invoiceHeaderMode: InvoiceHeaderMode;
  invoiceLetterheadTopMm: number; // blank space reserved at the top in letterhead mode
  invoiceLetterheadBottomMm: number; // blank space reserved at the bottom in letterhead mode
  invoiceFooterText: string; // custom footer (a thank-you line, small print…)
  invoiceLogoDataUrl: string; // uploaded company logo (data URL); empty → Invoice X default mark
  invoiceStampDataUrl: string; // uploaded stamp/seal image (data URL)
  invoiceStampEnabled: boolean; // auto-apply the stamp to generated invoices
  invoiceTermsText: string; // terms & conditions block
  invoiceBankDetails: string; // bank account details block
}

/** The full persisted shape (one localStorage key). Mirrors a future DB schema. */
export interface Database {
  version: number;
  onboarded: boolean;
  company: Company;
  settings: Settings;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
}

/** Computed money totals for an invoice (never stored — always derived). */
export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  vatTotal: number;
  total: number;
}

/** Visual tone shared by Badge and status helpers (single source of truth). */
export type Tone = "gray" | "green" | "amber" | "red" | "blue" | "violet";
