/**
 * Turn a raw passkey/WebAuthn error into a calm, human message. Passkey flows
 * fail in a few predictable ways (user dismissed the prompt, feature not
 * enabled server-side, no credential on the device) that shouldn't read as
 * scary errors.
 */
export function passkeyErrorMessage(raw: string | undefined | null): string {
  const s = (raw ?? "").toLowerCase();
  if (!s) return "Something went wrong with the passkey. Try again.";
  if (s.includes("not allowed") || s.includes("timed out") || s.includes("abort") || s.includes("cancel")) {
    return "Passkey prompt was cancelled.";
  }
  if (s.includes("not enabled") || s.includes("experimental") || s.includes("disabled") || s.includes("not configured")) {
    return "Passkeys aren't switched on for this workspace yet.";
  }
  if (s.includes("no credential") || s.includes("no passkey") || s.includes("not found")) {
    return "No passkey found on this device. Add one from Settings after you sign in.";
  }
  return `Passkey step failed. ${raw}`;
}
