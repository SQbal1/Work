/**
 * ZATCA (Saudi e-invoicing) QR payload builder.
 *
 * The QR encodes a base64 string of TLV (Tag-Length-Value) fields. Tags 1-5
 * are the Phase-1 spec (always present); tags 6-8 are the Phase-2-style
 * fields (invoice hash, signature, public key), emitted only once an invoice
 * has been signed via the local development key in src/lib/zatca/signing.ts.
 * Tag 9 (certificate signature) is deliberately never emitted — there's no
 * real CA-issued certificate behind that key, so fabricating a value would be
 * dishonest. This is genuinely valid TLV, but the app does NOT submit to or
 * integrate with ZATCA's systems, and the Phase-2 fields are signed with a
 * self-signed dev key, not a ZATCA-issued CSID — the QR is a *preview*, not a
 * compliance guarantee. See CLAUDE.md.
 *
 * Tags: 1 seller name · 2 VAT number · 3 timestamp · 4 invoice total ·
 * 5 VAT total · 6 invoice hash · 7 signature · 8 public key.
 */

export interface ZatcaQrInput {
  sellerName: string;
  vatNumber: string;
  /** ISO-8601 timestamp of issuance. */
  timestamp: string;
  /** Grand total including VAT. */
  total: number;
  /** VAT amount. */
  vatTotal: number;
  /** base64(hex(sha256(...))) invoice hash — present once signed. */
  invoiceHash?: string;
  /** base64 ECDSA signature over invoiceHash — present once signed. */
  signature?: string;
  /** base64 DER-encoded public key — present once signed. */
  publicKey?: string;
}

/** Encode one TLV field: [tag][length][utf-8 value bytes]. */
function tlv(tag: number, value: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(value));
  return [tag, bytes.length, ...bytes];
}

/** Encode one TLV field from raw (already-decoded) bytes, e.g. a signature or public key. */
function tlvRaw(tag: number, bytes: number[]): number[] {
  return [tag, bytes.length, ...bytes];
}

/** Decode a base64 string to a byte array (works in both browser and Node). */
function base64ToBytes(base64: string): number[] {
  if (typeof atob === "function") {
    return Array.from(atob(base64), (c) => c.charCodeAt(0));
  }
  return Array.from(Buffer.from(base64, "base64"));
}

/** base64 of a byte array (UTF-8 safe, works with Arabic seller names). */
function bytesToBase64(bytes: number[]): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  if (typeof btoa === "function") return btoa(binary);
  // Node fallback (SSR): Buffer is available.
  return Buffer.from(binary, "binary").toString("base64");
}

/** Build the base64 TLV string that goes inside the ZATCA QR code. */
export function buildZatcaTlvBase64(input: ZatcaQrInput): string {
  const money = (n: number) => n.toFixed(2);
  const bytes = [
    ...tlv(1, input.sellerName || "—"),
    ...tlv(2, input.vatNumber || "—"),
    ...tlv(3, input.timestamp),
    ...tlv(4, money(input.total)),
    ...tlv(5, money(input.vatTotal)),
  ];
  if (input.invoiceHash) bytes.push(...tlv(6, input.invoiceHash));
  if (input.signature) bytes.push(...tlvRaw(7, base64ToBytes(input.signature)));
  if (input.publicKey) bytes.push(...tlvRaw(8, base64ToBytes(input.publicKey)));
  return bytesToBase64(bytes);
}
