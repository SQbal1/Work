/**
 * ZATCA Phase-2 structural preview: keying, hashing, and signing.
 *
 * The keypair generated here is a locally-generated, self-signed development
 * key — NOT a ZATCA-issued CSID. It lets the app produce an internally
 * consistent hash chain and ECDSA signature for preview purposes only. See
 * CLAUDE.md and the Settings → "VAT & ZATCA" card for the actual compliance
 * status. Server-only (uses Node's `crypto`); never import from client code.
 */

import { createHash, createSign, createVerify, generateKeyPairSync } from "crypto";

/**
 * ZATCA-documented seed for the first invoice's Previous Invoice Hash (PIH):
 * base64(hex(sha256("0"))). Confirmed against the public Fatoora Developer
 * Community docs — not something we invented.
 */
export const FIRST_INVOICE_PIH_SEED =
  "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==";

export interface ZatcaKeypair {
  privateKeyPem: string;
  publicKeyPem: string;
}

/** Generate a fresh ECDSA (secp256k1 — ZATCA's curve) keypair, PEM-encoded. */
export function generateZatcaKeypair(): ZatcaKeypair {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "secp256k1",
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  return { privateKeyPem: privateKey as unknown as string, publicKeyPem: publicKey as unknown as string };
}

/**
 * ZATCA hashes invoice content as base64(hex(sha256(content))) — the hex
 * digest string is base64-encoded, not the raw hash bytes. This is a
 * documented quirk of their spec (confirmed against public examples), not a
 * mistake — get this double-encoding wrong and every downstream hash/QR/PIH
 * value silently disagrees with a real ZATCA implementation.
 */
export function hashInvoiceContent(content: string): string {
  const hex = createHash("sha256").update(content, "utf8").digest("hex");
  return Buffer.from(hex, "utf8").toString("base64");
}

/** Sign a (base64-encoded) invoice hash with the workspace's ECDSA key. Returns a base64 signature. */
export function signInvoiceHash(privateKeyPem: string, invoiceHashBase64: string): string {
  const signer = createSign("SHA256");
  signer.update(invoiceHashBase64, "utf8");
  signer.end();
  return signer.sign(privateKeyPem).toString("base64");
}

/** Verify a signature against the workspace's public key — used in tests, not the live UI. */
export function verifyInvoiceSignature(
  publicKeyPem: string,
  invoiceHashBase64: string,
  signatureBase64: string,
): boolean {
  const verifier = createVerify("SHA256");
  verifier.update(invoiceHashBase64, "utf8");
  verifier.end();
  return verifier.verify(publicKeyPem, Buffer.from(signatureBase64, "base64"));
}

/**
 * Public key as raw bytes (SPKI DER, stripped of the PEM armor) — this is
 * what goes into the Phase-2 QR's tag 8, not the PEM text itself.
 */
export function publicKeyPemToDerBase64(publicKeyPem: string): string {
  const base64Body = publicKeyPem
    .split("\n")
    .filter((line) => line && !line.startsWith("-----"))
    .join("");
  return base64Body;
}
