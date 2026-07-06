/**
 * ZATCA CSID onboarding, step 2: exchange a CSR + OTP for a Compliance CSID.
 *
 * This calls ZATCA's real `/compliance` endpoint — the first live network
 * call in the onboarding flow (everything before this, CSR generation, is
 * purely local). Endpoint URLs, headers, and the request/response shape are
 * taken directly from Microsoft's published Dynamics 365 Saudi e-invoicing
 * onboarding guide, which reproduces ZATCA's own onboarding script verbatim.
 * The request/response wiring (URL, headers, csr encoding) has been
 * confirmed against the live simulation endpoint: a well-formed CSR from
 * this module gets back `{"errors":[{"code":"Invalid-OTP", ...}]}` — i.e.
 * ZATCA parsed and accepted the CSR itself and only rejected the (test)
 * OTP. What hasn't been exercised is a *real* OTP, since it's single-use and
 * time-limited (1 hour) and tied to the user's own Fatoora account.
 *
 * Quirk carried over from the reference script: the "csr" field is
 * base64(full PEM text, including the "-----BEGIN/END CERTIFICATE
 * REQUEST-----" armor and newlines) — not base64 of the raw DER, and not the
 * PEM's own inner base64 re-decoded. Get this wrong and ZATCA rejects the
 * request outright. The same double-encoding shape reappears in the
 * response: `binarySecurityToken` is base64 of the certificate's PEM body
 * text (itself already base64), which must be unwrapped once and re-armored
 * with "-----BEGIN/END CERTIFICATE-----" before it's a usable PEM cert.
 *
 * ZATCA's error body shape isn't consistent across failure layers — observed
 * live as both `{"errors":[{"code","message"}]}` (OTP/business-rule
 * failures) and `{"errorCode","errorCategory","errorMessage"}` (malformed
 * request failures) — extractZatcaErrorMessage handles both.
 */

import type { ZatcaCsrEnvironment } from "./csr";

const ZATCA_BASE_URL: Record<ZatcaCsrEnvironment, string> = {
  simulation: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
  production: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
};

export interface ZatcaComplianceCsidResult {
  requestId: string;
  /** The base64 binarySecurityToken exactly as ZATCA returned it — this is also the Basic Auth username for later calls, so it's kept as-is, not decoded. */
  binarySecurityTokenBase64: string;
  /** The certificate, re-armored as a standard PEM (decoded once from binarySecurityToken). */
  certificatePem: string;
  secret: string;
}

function extractZatcaErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (Array.isArray(obj.errors)) {
      const parts = obj.errors.map((e) =>
        e && typeof e === "object" ? [(e as Record<string, unknown>).code, (e as Record<string, unknown>).message].filter(Boolean).join(": ") : String(e),
      );
      if (parts.length) return parts.join("; ");
    }
    if (typeof obj.errorMessage === "string") {
      return [obj.errorCategory, obj.errorMessage].filter(Boolean).join(": ");
    }
  }
  return `ZATCA returned HTTP ${status} with no readable error body`;
}

export class ZatcaComplianceCsidError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ZatcaComplianceCsidError";
  }
}

/** Request a Compliance CSID from ZATCA. Throws ZatcaComplianceCsidError on any non-2xx or malformed response. */
export async function requestZatcaComplianceCsid(
  environment: ZatcaCsrEnvironment,
  csrPem: string,
  otp: string,
): Promise<ZatcaComplianceCsidResult> {
  const csrBase64 = Buffer.from(csrPem, "utf8").toString("base64");

  const response = await fetch(`${ZATCA_BASE_URL[environment]}/compliance`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Version": "V2",
      OTP: otp,
    },
    body: JSON.stringify({ csr: csrBase64 }),
  });

  const rawText = await response.text();
  let body: unknown;
  try {
    body = rawText ? JSON.parse(rawText) : null;
  } catch {
    body = rawText;
  }

  if (!response.ok) {
    throw new ZatcaComplianceCsidError(extractZatcaErrorMessage(body, response.status), response.status, body);
  }

  const parsed = body as {
    requestID?: number | string;
    binarySecurityToken?: string;
    secret?: string;
    dispositionMessage?: string;
  } | null;

  if (!parsed?.binarySecurityToken || !parsed?.secret || parsed.requestID == null) {
    throw new ZatcaComplianceCsidError(
      "ZATCA response was missing requestID, binarySecurityToken, or secret",
      response.status,
      body,
    );
  }

  const certBody = Buffer.from(parsed.binarySecurityToken, "base64").toString("utf8");
  const certificatePem = `-----BEGIN CERTIFICATE-----\n${certBody}\n-----END CERTIFICATE-----\n`;

  return {
    requestId: String(parsed.requestID),
    binarySecurityTokenBase64: parsed.binarySecurityToken,
    certificatePem,
    secret: parsed.secret,
  };
}
