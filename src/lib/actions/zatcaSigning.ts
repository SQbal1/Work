"use server";

import { requireWorkspaceId } from "./workspace";
import { rowToCompany, rowToCustomer, rowToInvoice, rowToSettings } from "./mappers";
import { buildUblInvoiceXml } from "@/lib/zatca/ubl";
import { computeTotals } from "@/lib/calc";
import {
  generateZatcaKeypair,
  hashInvoiceContent,
  publicKeyPemToDerBase64,
  signInvoiceHash,
} from "@/lib/zatca/signing";

export interface ZatcaSigningResult {
  icv: number;
  previousHash: string;
  invoiceHash: string;
  signature: string;
  publicKey: string;
  signedAt: string;
}

/**
 * Fetches the workspace's local development signing key, generating one on
 * first use. Race-safe under concurrent calls via `upsert(..., { ignoreDuplicates: true })`
 * followed by a re-select, so two near-simultaneous callers land on the same
 * key rather than erroring. Internal only — never return the private key
 * from an exported action.
 */
async function getOrCreateZatcaKeyRow(
  supabase: Awaited<ReturnType<typeof requireWorkspaceId>>["supabase"],
  workspaceId: string,
): Promise<{ privateKeyPem: string; publicKeyPem: string }> {
  const { data: existing, error: selectError } = await supabase
    .from("zatca_keys")
    .select("private_key_pem, public_key_pem")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return { privateKeyPem: existing.private_key_pem, publicKeyPem: existing.public_key_pem };

  const generated = generateZatcaKeypair();
  const { error: upsertError } = await supabase.from("zatca_keys").upsert(
    {
      workspace_id: workspaceId,
      private_key_pem: generated.privateKeyPem,
      public_key_pem: generated.publicKeyPem,
    },
    { onConflict: "workspace_id", ignoreDuplicates: true },
  );
  if (upsertError) throw upsertError;

  const { data: row, error: refetchError } = await supabase
    .from("zatca_keys")
    .select("private_key_pem, public_key_pem")
    .eq("workspace_id", workspaceId)
    .single();
  if (refetchError) throw refetchError;
  return { privateKeyPem: row.private_key_pem, publicKeyPem: row.public_key_pem };
}

/** Public-facing: ensures the workspace has a signing key, returns only the public half. */
export async function ensureZatcaKey(): Promise<{ publicKeyPem: string }> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const key = await getOrCreateZatcaKeyRow(supabase, workspaceId);
  return { publicKeyPem: key.publicKeyPem };
}

/**
 * Generates the UBL XML for an invoice, hashes and signs it with the
 * workspace's local development key, and records the result. This is a
 * structural preview — see src/lib/zatca/signing.ts and src/lib/zatca/ubl.ts
 * for exactly what is and isn't ZATCA-certified about it.
 */
export async function signInvoiceZatca(invoiceId: string): Promise<ZatcaSigningResult> {
  const { supabase, workspaceId } = await requireWorkspaceId();

  const key = await getOrCreateZatcaKeyRow(supabase, workspaceId);

  const [invoiceRes, companyRes, settingsRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, invoice_line_items(*)")
      .eq("id", invoiceId)
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
    supabase.from("companies").select("*").eq("workspace_id", workspaceId).single(),
    supabase.from("settings").select("*").eq("workspace_id", workspaceId).single(),
  ]);
  if (invoiceRes.error) throw invoiceRes.error;
  if (!invoiceRes.data) throw new Error("Invoice not found");
  if (companyRes.error) throw companyRes.error;
  if (settingsRes.error) throw settingsRes.error;

  const invoice = rowToInvoice(invoiceRes.data);
  if (invoice.zatcaSignedAt) throw new Error("Invoice already signed");

  let customer = null;
  if (invoice.customerId) {
    const { data: customerRow, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", invoice.customerId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (customerError) throw customerError;
    customer = customerRow ? rowToCustomer(customerRow) : null;
  }

  const company = rowToCompany(companyRes.data);
  const settings = rowToSettings(settingsRes.data);
  const totals = computeTotals(invoice.items, invoice.discountPercent);

  // Atomically claim the next ICV + previous-invoice-hash slot before building
  // the XML — see zatca_reserve_sequence() in migration 0012 for why this must
  // be a separate, row-locked step rather than a plain read.
  const { data: reservedRows, error: reserveError } = await supabase.rpc("zatca_reserve_sequence", {
    p_invoice_id: invoiceId,
    p_workspace_id: workspaceId,
  });
  if (reserveError) throw reserveError;
  const reservation = reservedRows?.[0];
  if (!reservation) throw new Error("Failed to reserve a ZATCA sequence slot for this invoice");

  const signedAt = new Date();
  const xml = buildUblInvoiceXml({
    company,
    customer,
    invoiceNumber: invoice.number,
    invoiceId: invoice.id,
    issueDateTime: signedAt,
    currency: settings.currency,
    items: invoice.items,
    totals,
    icv: reservation.icv,
    previousHash: reservation.previous_hash,
  });

  const invoiceHash = hashInvoiceContent(xml);
  const signature = signInvoiceHash(key.privateKeyPem, invoiceHash);
  const publicKey = publicKeyPemToDerBase64(key.publicKeyPem);

  const { error: finalizeError } = await supabase.rpc("zatca_finalize_signature", {
    p_invoice_id: invoiceId,
    p_workspace_id: workspaceId,
    p_invoice_hash: invoiceHash,
    p_signature: signature,
    p_public_key: publicKey,
    p_ubl_xml: xml,
  });
  if (finalizeError) throw finalizeError;

  return {
    icv: reservation.icv,
    previousHash: reservation.previous_hash,
    invoiceHash,
    signature,
    publicKey,
    signedAt: signedAt.toISOString(),
  };
}

/** Pulls the exact XML that was hashed/signed back out of its immutable audit event, for download. */
export async function getZatcaSignedXml(invoiceId: string): Promise<string> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("invoice_events")
    .select("payload")
    .eq("invoice_id", invoiceId)
    .eq("workspace_id", workspaceId)
    .eq("event_type", "signed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const payload = data?.payload as { ubl_xml?: string } | null;
  if (!payload?.ubl_xml) throw new Error("No signed XML found for this invoice");
  return payload.ubl_xml;
}
