"use server";

import type { Company, Settings } from "@/types";
import type { TablesUpdate } from "@/types/supabase";
import { requireWorkspaceId } from "./workspace";

export async function updateCompany(data: Partial<Company>): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const patch: TablesUpdate<"companies"> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.legalName !== undefined) patch.legal_name = data.legalName;
  if (data.email !== undefined) patch.email = data.email;
  if (data.phone !== undefined) patch.phone = data.phone;
  if (data.vatNumber !== undefined) patch.vat_number = data.vatNumber;
  if (data.crNumber !== undefined) patch.cr_number = data.crNumber;
  if (data.address !== undefined) patch.address = data.address;
  if (data.city !== undefined) patch.city = data.city;
  if (data.businessType !== undefined) patch.business_type = data.businessType;

  const { error } = await supabase.from("companies").update(patch).eq("workspace_id", workspaceId);
  if (error) throw error;
}

export async function updateSettings(data: Partial<Settings>): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const patch: TablesUpdate<"settings"> = {};
  if (data.invoicePrefix !== undefined) patch.invoice_prefix = data.invoicePrefix;
  if (data.nextInvoiceNumber !== undefined) patch.next_invoice_number = data.nextInvoiceNumber;
  if (data.defaultVatRate !== undefined) patch.default_vat_rate = data.defaultVatRate;
  if (data.defaultDueDays !== undefined) patch.default_due_days = data.defaultDueDays;
  if (data.defaultNotes !== undefined) patch.default_notes = data.defaultNotes;
  if (data.currency !== undefined) patch.currency = data.currency;
  if (data.invoiceHeaderMode !== undefined) patch.invoice_header_mode = data.invoiceHeaderMode;
  if (data.invoiceLetterheadTopMm !== undefined)
    patch.invoice_letterhead_top_mm = data.invoiceLetterheadTopMm;
  if (data.invoiceLetterheadBottomMm !== undefined)
    patch.invoice_letterhead_bottom_mm = data.invoiceLetterheadBottomMm;
  if (data.invoiceFooterText !== undefined) patch.invoice_footer_text = data.invoiceFooterText;
  if (data.invoiceLogoDataUrl !== undefined) patch.invoice_logo_data_url = data.invoiceLogoDataUrl;
  if (data.invoiceStampDataUrl !== undefined) patch.invoice_stamp_data_url = data.invoiceStampDataUrl;
  if (data.invoiceStampEnabled !== undefined) patch.invoice_stamp_enabled = data.invoiceStampEnabled;
  if (data.invoiceTermsText !== undefined) patch.invoice_terms_text = data.invoiceTermsText;
  if (data.invoiceBankDetails !== undefined) patch.invoice_bank_details = data.invoiceBankDetails;

  const { error } = await supabase.from("settings").update(patch).eq("workspace_id", workspaceId);
  if (error) throw error;
}

export async function setOnboarded(value: boolean): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const { error } = await supabase
    .from("settings")
    .update({ onboarded: value })
    .eq("workspace_id", workspaceId);
  if (error) throw error;
}
