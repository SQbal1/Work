/**
 * ZATCA CSID onboarding: Certificate Signing Request (CSR) builder.
 *
 * ZATCA requires a PKCS#10 CSR with a secp256k1 key and a specific,
 * non-standard field layout: most identity fields sit in a subjectAltName
 * "directoryName" extension rather than the Subject DN directly, plus a
 * Microsoft-style "certificate template name" extension that routes the CSR
 * to the right cert pool. There is no off-the-shelf Node library that builds
 * this shape (node-forge's CSR path is RSA-oriented; WebCrypto-based
 * libraries don't support secp256k1), so this hand-rolls the minimal
 * DER/ASN.1 needed — the same approach signing.ts already takes for ZATCA's
 * other crypto quirks.
 *
 * Field layout cross-checked against Microsoft's published Dynamics 365
 * Saudi e-invoicing onboarding guide (which documents ZATCA's own CSR config
 * template + onboarding script verbatim) — closer to source than the
 * earlier community-blog pass, though still not verified against a live
 * ZATCA submission. If ZATCA's actual validator rejects a field, that tells
 * us exactly what to correct here.
 */

import { generateKeyPairSync, sign as cryptoSign, type KeyObject } from "crypto";

export type ZatcaInvoiceTypeSupport = "standard" | "simplified" | "both";

/**
 * ZATCA's 4-digit invoice-type flag: [Standard, Simplified, reserved, reserved].
 * "1000" standard-only, "0100" simplified-only, "1100" both — per public CSR
 * config samples. The two reserved digits are always "00".
 */
const INVOICE_TYPE_CODE: Record<ZatcaInvoiceTypeSupport, string> = {
  standard: "1000",
  simplified: "0100",
  both: "1100",
};

const OID = {
  countryName: "2.5.4.6",
  organizationName: "2.5.4.10",
  organizationalUnitName: "2.5.4.11",
  commonName: "2.5.4.3",
  serialNumber: "2.5.4.5",
  uid: "0.9.2342.19200300.100.1.1",
  title: "2.5.4.12",
  registeredAddress: "2.5.4.26",
  businessCategory: "2.5.4.15",
  extensionRequest: "1.2.840.113549.1.9.14",
  subjectAltName: "2.5.29.17",
  /** Microsoft AD "certificate template name" OID — ZATCA reuses it to say which cert pool/environment this CSR targets. */
  certificateTemplateName: "1.3.6.1.4.1.311.20.2",
  ecdsaWithSha256: "1.2.840.10045.4.3.2",
};

export type ZatcaCsrEnvironment = "simulation" | "production";

/**
 * ZATCA's simulation portal requires the Common Name AND certificate
 * template name to be the literal fixed string "PREZATCA-Code-Signing" (not
 * the business's own unit name) — a documented quirk, not a placeholder we
 * forgot to fill in. Production uses the real business/branch name as CN and
 * the un-prefixed template name.
 */
export const ZATCA_CERT_TEMPLATE_NAME: Record<ZatcaCsrEnvironment, string> = {
  simulation: "PREZATCA-Code-Signing",
  production: "ZATCA-Code-Signing",
};

export interface ZatcaCsrKeypair {
  privateKeyPem: string;
  privateKeyObject: KeyObject;
  publicKeySpkiDer: Buffer;
}

/** secp256k1 keypair for CSID onboarding — a distinct key from the internal Phase-2-preview signing key. */
export function generateZatcaCsrKeypair(): ZatcaCsrKeypair {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "secp256k1" });
  return {
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }) as string,
    privateKeyObject: privateKey,
    publicKeySpkiDer: publicKey.export({ type: "spki", format: "der" }) as Buffer,
  };
}

export interface ZatcaCsrInput {
  organizationName: string;
  organizationalUnit: string;
  /** Ignored for the "simulation" environment — ZATCA requires a fixed CN there. See ZATCA_CERT_TEMPLATE_NAME. */
  commonName: string;
  vatNumber: string;
  address: string;
  businessCategory: string;
  invoiceType: ZatcaInvoiceTypeSupport;
  /** Unique-per-request identifier folded into the DN serialNumber (EGS unit id). */
  serial: string;
  environment: ZatcaCsrEnvironment;
}

// --- Minimal DER/ASN.1 encoding helpers ---

function derLength(n: number): Buffer {
  if (n < 0x80) return Buffer.from([n]);
  const bytes: number[] = [];
  let v = n;
  while (v > 0) {
    bytes.unshift(v & 0xff);
    v >>= 8;
  }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}

function derTLV(tag: number, content: Buffer): Buffer {
  return Buffer.concat([Buffer.from([tag]), derLength(content.length), content]);
}

function derSequence(...parts: Buffer[]): Buffer {
  return derTLV(0x30, Buffer.concat(parts));
}

function derSet(...parts: Buffer[]): Buffer {
  return derTLV(0x31, Buffer.concat(parts));
}

function derOid(oid: string): Buffer {
  const parts = oid.split(".").map(Number);
  const bytes: number[] = [parts[0] * 40 + parts[1]];
  for (const part of parts.slice(2)) {
    if (part < 128) {
      bytes.push(part);
      continue;
    }
    const chunk: number[] = [part & 0x7f];
    let v = part >> 7;
    while (v > 0) {
      chunk.unshift((v & 0x7f) | 0x80);
      v >>= 7;
    }
    bytes.push(...chunk);
  }
  return derTLV(0x06, Buffer.from(bytes));
}

function derPrintableString(s: string): Buffer {
  return derTLV(0x13, Buffer.from(s, "ascii"));
}

function derUtf8String(s: string): Buffer {
  return derTLV(0x0c, Buffer.from(s, "utf8"));
}

function derOctetString(b: Buffer): Buffer {
  return derTLV(0x04, b);
}

function derInteger0(): Buffer {
  return derTLV(0x02, Buffer.from([0x00]));
}

function derBitString(b: Buffer): Buffer {
  return derTLV(0x03, Buffer.concat([Buffer.from([0x00]), b]));
}

/** Context-specific, constructed tag — used for both EXPLICIT wrapping and [n] IMPLICIT SET/SEQUENCE. */
function derContext(tagNumber: number, content: Buffer): Buffer {
  return derTLV(0xa0 | tagNumber, content);
}

function attributeTypeAndValue(oid: string, value: Buffer): Buffer {
  return derSequence(derOid(oid), value);
}

function rdn(oid: string, value: Buffer): Buffer {
  return derSet(attributeTypeAndValue(oid, value));
}

/** Builds the CSR's PEM. Signs with the workspace's ECDSA (secp256k1) private key. */
export function buildZatcaCsr(input: ZatcaCsrInput, keypair: ZatcaCsrKeypair): string {
  const templateName = ZATCA_CERT_TEMPLATE_NAME[input.environment];
  // Simulation forces a fixed CN regardless of the business's own unit name — see ZATCA_CERT_TEMPLATE_NAME.
  const commonName = input.environment === "simulation" ? templateName : input.commonName;

  // Subject DN: identity/naming fields ZATCA expects directly on the Subject.
  const subjectSerial = `1-InvoiceX|2-1.0.0|3-${input.serial}`;
  const subject = derSequence(
    rdn(OID.countryName, derPrintableString("SA")),
    rdn(OID.organizationalUnitName, derUtf8String(input.organizationalUnit)),
    rdn(OID.organizationName, derUtf8String(input.organizationName)),
    rdn(OID.commonName, derUtf8String(commonName)),
    rdn(OID.serialNumber, derPrintableString(subjectSerial)),
  );

  // certificateTemplateName: tells ZATCA which cert pool/environment this CSR
  // targets (production vs. simulation). Unlike the SAN extension below,
  // this one's extnValue is a bare PrintableString, not a wrapped Name.
  const certTemplateExtension = derSequence(
    derOid(OID.certificateTemplateName),
    derOctetString(derPrintableString(templateName)),
  );

  // subjectAltName -> directoryName: ZATCA's non-standard home for VAT number,
  // invoice-type support, address, and business category. directoryName is a
  // CHOICE alternative, so per X.680 it needs EXPLICIT (not implicit) tagging —
  // tag [4] wraps the full inner Name SEQUENCE TLV, not just its content.
  const sanName = derSequence(
    rdn(OID.uid, derPrintableString(input.vatNumber)),
    rdn(OID.title, derUtf8String(INVOICE_TYPE_CODE[input.invoiceType])),
    rdn(OID.registeredAddress, derUtf8String(input.address)),
    rdn(OID.businessCategory, derUtf8String(input.businessCategory)),
  );
  const directoryNameGeneralName = derContext(4, sanName);
  const generalNames = derSequence(directoryNameGeneralName);
  const sanExtension = derSequence(derOid(OID.subjectAltName), derOctetString(generalNames));
  const extensions = derSequence(certTemplateExtension, sanExtension);

  const extensionRequestAttribute = derSequence(derOid(OID.extensionRequest), derSet(extensions));
  // attributes ::= [0] IMPLICIT SET OF Attribute — implicit tagging replaces
  // the universal SET tag (0x31) with the context tag; content stays the same.
  const attributes = derContext(0, extensionRequestAttribute);

  const certificationRequestInfo = derSequence(
    derInteger0(),
    subject,
    keypair.publicKeySpkiDer,
    attributes,
  );

  const signature = cryptoSign("sha256", certificationRequestInfo, keypair.privateKeyObject);
  const signatureAlgorithm = derSequence(derOid(OID.ecdsaWithSha256));

  const csrDer = derSequence(certificationRequestInfo, signatureAlgorithm, derBitString(signature));

  const base64 = csrDer.toString("base64");
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN CERTIFICATE REQUEST-----\n${lines.join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
}
