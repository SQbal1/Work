"use server";

import { randomUUID } from "crypto";
import { requireWorkspaceId } from "./workspace";
import { buildZatcaCsr, generateZatcaCsrKeypair, type ZatcaCsrEnvironment, type ZatcaInvoiceTypeSupport } from "@/lib/zatca/csr";
import { encryptZatcaSecret } from "@/lib/zatca/csrEncryption";
import { requestZatcaComplianceCsid, ZatcaComplianceCsidError } from "@/lib/zatca/complianceCsid";

export interface ZatcaCsrInput {
  vatNumber: string;
  organizationName: string;
  branchName: string;
  city: string;
  invoiceType: ZatcaInvoiceTypeSupport;
  environment: ZatcaCsrEnvironment;
}

export interface ZatcaCsrStatus {
  status: "not_started" | "csr_generated" | "compliance_csid_received";
  csrPem: string | null;
  vatNumber: string | null;
  organizationName: string | null;
  branchName: string | null;
  city: string | null;
  invoiceType: ZatcaInvoiceTypeSupport | null;
  environment: ZatcaCsrEnvironment | null;
  zatcaRequestId: string | null;
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
  environment: null,
  zatcaRequestId: null,
  createdAt: null,
};

interface StatusRow {
  status: string;
  csr_pem: string;
  vat_number: string;
  organization_name: string;
  branch_name: string;
  city: string;
  invoice_type: string;
  environment: string;
  zatca_request_id: string | null;
  created_at: string;
}

function rowToStatus(row: StatusRow): ZatcaCsrStatus {
  return {
    status: row.status as ZatcaCsrStatus["status"],
    csrPem: row.csr_pem,
    vatNumber: row.vat_number,
    organizationName: row.organization_name,
    branchName: row.branch_name,
    city: row.city,
    invoiceType: row.invoice_type as ZatcaInvoiceTypeSupport,
    environment: row.environment as ZatcaCsrEnvironment,
    zatcaRequestId: row.zatca_request_id,
    createdAt: row.created_at,
  };
}

const STATUS_COLUMNS =
  "status, csr_pem, vat_number, organization_name, branch_name, city, invoice_type, environment, zatca_request_id, created_at";

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
 * the old CSR would invalidate that request, which the UI warns about. A
 * fresh CSR resets status back to "csr_generated", clearing any prior
 * Compliance CSID fields — they'd no longer match the new key.
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
      environment: input.environment,
    },
    keypair,
  );
  const encryptedPrivateKey = encryptZatcaSecret(keypair.privateKeyPem);

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
        environment: input.environment,
        csr_pem: csrPem,
        encrypted_private_key: encryptedPrivateKey,
        status: "csr_generated",
        zatca_request_id: null,
        compliance_csid: null,
        encrypted_compliance_secret: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id" },
    )
    .select(STATUS_COLUMNS)
    .single();
  if (error) throw error;
  return rowToStatus(data);
}

/**
 * Exchanges the workspace's already-generated CSR + a Fatoora portal OTP for
 * a real ZATCA Compliance CSID. This is the first live call to ZATCA in the
 * onboarding flow — everything before it is local. Requires a CSR to already
 * exist (status "csr_generated"); the OTP is single-use and expires ~1 hour
 * after being generated on ZATCA's side.
 */
export async function requestZatcaCompliance(otp: string): Promise<ZatcaCsrStatus> {
  const { supabase, workspaceId } = await requireWorkspaceId();

  const trimmedOtp = otp.trim();
  if (!trimmedOtp) throw new Error("OTP is required");

  const { data: existing, error: selectError } = await supabase
    .from("zatca_csr_requests")
    .select("csr_pem, environment, status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (selectError) throw selectError;
  if (!existing) throw new Error("Generate a CSR before requesting a Compliance CSID");
  if (existing.status === "compliance_csid_received") {
    throw new Error("This workspace already has a Compliance CSID — regenerate the CSR first to request a new one");
  }

  let result;
  try {
    result = await requestZatcaComplianceCsid(existing.environment as ZatcaCsrEnvironment, existing.csr_pem, trimmedOtp);
  } catch (err) {
    if (err instanceof ZatcaComplianceCsidError) {
      throw new Error(`ZATCA rejected the request (HTTP ${err.status}): ${err.message}`);
    }
    throw err;
  }

  const encryptedSecret = encryptZatcaSecret(result.secret);

  const { data, error } = await supabase
    .from("zatca_csr_requests")
    .update({
      status: "compliance_csid_received",
      zatca_request_id: result.requestId,
      compliance_csid: result.binarySecurityTokenBase64,
      encrypted_compliance_secret: encryptedSecret,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .select(STATUS_COLUMNS)
    .single();
  if (error) throw error;
  return rowToStatus(data);
}
