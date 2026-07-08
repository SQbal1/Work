import type {
  BusinessTypeId,
  Company,
  Customer,
  Invoice,
  InvoiceHeaderMode,
  InvoiceLineItem,
  InvoiceStatus,
  Product,
  Settings,
  VatCategory,
} from "@/types";
import type { Tables } from "@/types/supabase";

/** Snake_case DB rows -> the app's camelCase types (the shape components already expect). */

export function rowToCompany(row: Tables<"companies">): Company {
  return {
    name: row.name,
    legalName: row.legal_name,
    email: row.email,
    phone: row.phone,
    vatNumber: row.vat_number,
    crNumber: row.cr_number,
    address: row.address,
    city: row.city,
    businessType: row.business_type as BusinessTypeId,
  };
}

export function rowToSettings(row: Tables<"settings">): Settings {
  return {
    invoicePrefix: row.invoice_prefix,
    nextInvoiceNumber: row.next_invoice_number,
    defaultVatRate: row.default_vat_rate,
    defaultDueDays: row.default_due_days,
    defaultNotes: row.default_notes,
    currency: row.currency,
    invoiceHeaderMode: row.invoice_header_mode as InvoiceHeaderMode,
    invoiceLetterheadTopMm: row.invoice_letterhead_top_mm,
    invoiceLetterheadBottomMm: row.invoice_letterhead_bottom_mm,
    invoiceFooterText: row.invoice_footer_text,
    invoiceLogoDataUrl: row.invoice_logo_data_url,
    invoiceStampDataUrl: row.invoice_stamp_data_url,
    invoiceStampEnabled: row.invoice_stamp_enabled,
    invoiceTermsText: row.invoice_terms_text,
    invoiceBankDetails: row.invoice_bank_details,
  };
}

export function rowToCustomer(row: Tables<"customers">): Customer {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    vatNumber: row.vat_number,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function rowToProduct(row: Tables<"products">): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    unitPrice: row.unit_price,
    vatCategory: row.vat_category as VatCategory,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function rowToLineItem(row: Tables<"invoice_line_items">): InvoiceLineItem {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    vatRate: row.vat_rate,
  };
}

export function rowToInvoice(
  row: Tables<"invoices"> & { invoice_line_items?: Tables<"invoice_line_items">[] },
): Invoice {
  return {
    id: row.id,
    number: row.number,
    customerId: row.customer_id,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    status: row.status as InvoiceStatus,
    items: (row.invoice_line_items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(rowToLineItem),
    discountPercent: row.discount_percent,
    notes: row.notes,
    paidDate: row.paid_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    zatcaIcv: row.zatca_icv,
    zatcaPreviousHash: row.zatca_previous_hash,
    zatcaInvoiceHash: row.zatca_invoice_hash,
    zatcaSignature: row.zatca_signature,
    zatcaPublicKey: row.zatca_public_key,
    zatcaSignedAt: row.zatca_signed_at,
  };
}
