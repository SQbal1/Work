/**
 * Encrypts the private key generated alongside each workspace's ZATCA CSR
 * before it touches the database — this key will eventually correspond to a
 * real ZATCA-issued Compliance/Production CSID, so it's treated as a secret
 * from day one rather than "harden it later." AES-256-GCM with a server-only
 * key from ZATCA_CSR_ENCRYPTION_KEY (never NEXT_PUBLIC_, never sent to the
 * browser). Server-only — never import from client code.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const raw = process.env.ZATCA_CSR_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ZATCA_CSR_ENCRYPTION_KEY is not set — required to store ZATCA CSR private keys. Generate one with `openssl rand -base64 32` and set it server-side.",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ZATCA_CSR_ENCRYPTION_KEY must decode to exactly 32 bytes (base64 output of `openssl rand -base64 32`).");
  }
  return key;
}

/** Returns base64(iv || authTag || ciphertext) — a single opaque blob to store in one column. */
export function encryptZatcaCsrPrivateKey(privateKeyPem: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(privateKeyPem, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/** Inverse of encryptZatcaCsrPrivateKey. Not currently called from any exported action — no code path returns the raw private key to the client yet. */
export function decryptZatcaCsrPrivateKey(blob: string): string {
  const key = getEncryptionKey();
  const raw = Buffer.from(blob, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
