"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database as AppDatabase } from "@/types";
import { createEmptyDatabase } from "@/data/seed";
import { rowToCompany, rowToCustomer, rowToInvoice, rowToProduct, rowToSettings } from "./mappers";

/** Every other action file builds on these two helpers — never trust a client-supplied workspace_id. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function getCurrentWorkspaceId(): Promise<string | null> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return data?.workspace_id ?? null;
}

export async function requireWorkspaceId() {
  const { supabase } = await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("No workspace for the current user");
  return { supabase, workspaceId };
}

export async function createWorkspace(name: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("bootstrap_workspace", { p_name: name });
  if (error) throw error;
}

/** Bulk fetch for store hydration. Returns null when signed in but no workspace yet. */
export async function getWorkspaceData(): Promise<AppDatabase | null> {
  const { supabase } = await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const [companyRes, settingsRes, customersRes, productsRes, invoicesRes] = await Promise.all([
    supabase.from("companies").select("*").eq("workspace_id", workspaceId).single(),
    supabase.from("settings").select("*").eq("workspace_id", workspaceId).single(),
    supabase
      .from("customers")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("*, invoice_line_items(*)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
  ]);

  if (companyRes.error) throw companyRes.error;
  if (settingsRes.error) throw settingsRes.error;
  if (customersRes.error) throw customersRes.error;
  if (productsRes.error) throw productsRes.error;
  if (invoicesRes.error) throw invoicesRes.error;

  return {
    version: 1,
    onboarded: settingsRes.data.onboarded,
    company: rowToCompany(companyRes.data),
    settings: rowToSettings(settingsRes.data),
    customers: customersRes.data.map(rowToCustomer),
    products: productsRes.data.map(rowToProduct),
    invoices: invoicesRes.data.map(rowToInvoice),
  };
}

/** Used by Settings → "Clear all data" for signed-in workspaces (see settings gating). */
export async function deleteAllWorkspaceData(): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();

  const { error: invoicesError } = await supabase.from("invoices").delete().eq("workspace_id", workspaceId);
  if (invoicesError) throw invoicesError;

  const { error: customersError } = await supabase
    .from("customers")
    .delete()
    .eq("workspace_id", workspaceId);
  if (customersError) throw customersError;

  const { error: productsError } = await supabase.from("products").delete().eq("workspace_id", workspaceId);
  if (productsError) throw productsError;

  const empty = createEmptyDatabase();
  const { error: companyError } = await supabase
    .from("companies")
    .update({
      name: empty.company.name,
      legal_name: empty.company.legalName,
      email: empty.company.email,
      phone: empty.company.phone,
      vat_number: empty.company.vatNumber,
      cr_number: empty.company.crNumber,
      address: empty.company.address,
      city: empty.company.city,
      business_type: empty.company.businessType,
    })
    .eq("workspace_id", workspaceId);
  if (companyError) throw companyError;

  const { error: settingsError } = await supabase
    .from("settings")
    .update({
      invoice_prefix: empty.settings.invoicePrefix,
      next_invoice_number: empty.settings.nextInvoiceNumber,
      default_vat_rate: empty.settings.defaultVatRate,
      default_due_days: empty.settings.defaultDueDays,
      default_notes: empty.settings.defaultNotes,
      currency: empty.settings.currency,
      onboarded: false,
    })
    .eq("workspace_id", workspaceId);
  if (settingsError) throw settingsError;
}
