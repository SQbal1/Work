import type { Database } from "@/types";

/**
 * Safe localStorage wrapper. All access is guarded for SSR (no `window`) and
 * wrapped in try/catch so a corrupt value or private-mode browser never crashes
 * the app. This is the single seam to replace when wiring a real backend.
 */
const STORAGE_KEY = "placeholder_db_v1";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadDatabase(): Database | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Database;
    // Light shape guard — enough to reject obviously broken data.
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.invoices) ||
      !Array.isArray(parsed.customers) ||
      !Array.isArray(parsed.products)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDatabase(db: Database): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore quota / private-mode errors for the MVP.
  }
}

export function clearDatabase(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
