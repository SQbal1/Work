import type { Company, Customer, Database, Invoice, Product, Settings } from "@/types";

export type NewCustomer = Omit<Customer, "id" | "createdAt">;
export type NewProduct = Omit<Product, "id" | "createdAt">;
export type NewInvoice = Omit<Invoice, "id" | "number" | "createdAt" | "updatedAt">;

/**
 * A backend for the store: either `localAdapter` (localStorage, the original
 * MVP demo) or `supabaseAdapter` (real Postgres-backed workspace). `store.tsx`
 * picks one at runtime based on whether there's an authenticated session and
 * exposes the same mutator surface to components either way.
 */
export interface DataAdapter {
  /** Returns null when there's a session but no workspace yet (needs onboarding). */
  load(): Promise<Database | null>;
  createWorkspace(name: string): Promise<void>;

  addCustomer(data: NewCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<NewCustomer>): Promise<void>;
  deleteCustomer(id: string): Promise<void>;

  addProduct(data: NewProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<NewProduct>): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  addInvoice(data: NewInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<Omit<Invoice, "id">>): Promise<void>;
  deleteInvoice(id: string): Promise<void>;
  markInvoicePaid(id: string): Promise<void>;
  duplicateInvoice(id: string): Promise<Invoice | undefined>;

  updateCompany(data: Partial<Company>): Promise<void>;
  updateSettings(data: Partial<Settings>): Promise<void>;
  setOnboarded(value: boolean): Promise<void>;

  /** Local-mode only — supabaseAdapter rejects this (see settings gating). */
  resetDemoData(): Promise<void>;
  clearAllData(): Promise<void>;
}
