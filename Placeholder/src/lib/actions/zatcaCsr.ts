"use server";

import { randomUUID } from "crypto";
import { requireWorkspaceId } from "./workspace";
import { buildZatcaCsr, generateZatcaCsrKeypair, type ZatcaInvoiceTypeSupport } from "@/lib/zatca/csr";
import { encryptZatcaCsrPrivateKey } from "@/lib/zatca/csrEncryption";

export interface ZatcaCsrInput {
  vatNumber: string;
  organizationName: string;
  branchName: string;
  city: string;
  invoiceType: ZatcaInvoiceTypeSupport;
}

export interface ZatcaCsrStatus {
  status: "not_started" | "csr_generated";
  csrPem: string | null;
  vatNumber: string | null;
  organizationName: string | null;
  branchName: string | null;
  city: string | null;
  invoiceType: ZatcaInvoiceTypeSupport | null;
  createdAt: string | null;
}

const EMPTY_STATUS: ZatcaCsrStatus = {
  status: "not_started",
  csrPem: null,
  vatNumber: null,
  organizationName: null,
  branchName: null,
  city: null,
  invoiceType: null,
  createdAt: null,
};

function rowToStatus(row: {
  status: string;
  csr_pem: string;
  vat_number: string;
  organization_name: string;
  branch_name: string;
  city: string;
  invoice_type: string;
  created_at: string;
}): ZatcaCsrStatus {
  return {
    status: row.status as ZatcaCsrStatus["status"],
    csrPem: row.csr_pem,
    vatNumber: row.vat_number,
    organizationName: row.organization_name,
    branchName: row.branch_name,
    city: row.city,
    invoiceType: row.invoice_type as ZatcaInvoiceTypeSupport,
    createdAt: row.created_at,
  };
}

const STATUS_COLUMNS = "status, csr_pem, vat_number, organization_name, branch_name, city, invoice_type, created_at";

/** No row yet means onboarding hasn't started — that's a normal, expected state, not an error. */
export async function getZatcaCsrStatus(): Promise<ZatcaCsrStatus> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("zatca_csr_requests")
    .select(STATUS_COLUMNS)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY_STATUS;
  return rowToStatus(data);
}

/**
 * Generates a fresh secp256k1 keypair + CSR for this workspace's ZATCA CSID
 * onboarding, encrypts the private key, and stores both. Safe to call again
 * later (upserts) — regenerating before submitting through ZATCA's portal is
 * harmless; regenerating *after* already requesting a Compliance CSID with
 * the old CSR would invalidate that request, which the UI warns about.
 */
export async function generateZatcaCsr(input: ZatcaCsrInput): Promise<ZatcaCsrStatus> {
  const { supabase, workspaceId } = await requireWorkspaceId();

  const vatNumber = input.vatNumber.trim();
  const organizationName = input.organizationName.trim();
  const branchName = input.branchName.trim();
  const city = input.city.trim();

  if (!/^\d{15}$/.test(vatNumber)) throw new Error("VAT number must be exactly 15 digits");
  if (!organizationName) throw new Error("Organization name is required");
  if (!branchName) throw new Error("Branch name is required");
  if (!city) throw new Error("City is required");

  const keypair = generateZatcaCsrKeypair();
  const csrPem = buildZatcaCsr(
    {
      organizationName,
      organizationalUnit: branchName,
      commonName: branchName,
      vatNumber,
      address: city,
      businessCategory: organizationName,
      invoiceType: input.invoiceType,
      serial: randomUUID(),
    },
    keypair,
  );
  const encryptedPrivateKey = encryptZatcaCsrPrivateKey(keypair.privateKeyPem);

  const { data, error } = await supabase
    .from("zatca_csr_requests")
    .upsert(
      {
        workspace_id: workspaceId,
        vat_number: vatNumber,
        organization_name: organizationName,
        branch_name: branchName,
        city,
        invoice_type: input.invoiceType,
        csr_pem: csrPem,
        encrypted_private_key: encryptedPrivateKey,
        status: "csr_generated",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id" },
    )
    .select(STATUS_COLUMNS)
    .single();
  if (error) throw error;
  return rowToStatus(data);
}
