"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  Company,
  Customer,
  Database,
  Invoice,
  Product,
  Settings,
} from "@/types";
import type { NewCustomer, NewInvoice, NewProduct } from "./data/adapter";
import { localAdapter } from "./data/localAdapter";
import { supabaseAdapter } from "./data/supabaseAdapter";
import { createEmptyDatabase } from "@/data/seed";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import { todayISO } from "@/lib/format";

/**
 * The single client-side data store for the whole app. On mount it checks
 * for a Supabase session: signed-in users get the `supabaseAdapter` (real
 * Postgres, RLS-scoped to their workspace), everyone else gets the
 * `localAdapter` (today's localStorage demo, unchanged). Components only see
 * this context — they never talk to an adapter or Supabase directly.
 */

interface StoreValue {
  ready: boolean;
  /** True once there's an authenticated session (Supabase-backed, not local demo). */
  usingSupabase: boolean;
  /** False once signed in with no workspace yet — onboarding needs to create one. */
  hasWorkspace: boolean;
  onboarded: boolean;
  company: Company;
  settings: Settings;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];

  // Workspace
  createWorkspace: (name: string) => Promise<void>;

  // Customers
  addCustomer: (data: NewCustomer) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<NewCustomer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomer: (id: string | null) => Customer | undefined;

  // Products
  addProduct: (data: NewProduct) => Promise<Product>;
  updateProduct: (id: string, data: Partial<NewProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string | null) => Product | undefined;

  // Invoices
  peekInvoiceNumber: () => string;
  addInvoice: (data: NewInvoice) => Promise<Invoice>;
  updateInvoice: (id: string, data: Partial<Omit<Invoice, "id">>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoice: (id: string | null) => Invoice | undefined;
  markInvoicePaid: (id: string) => Promise<void>;
  duplicateInvoice: (id: string) => Promise<Invoice | undefined>;

  // Company & settings
  updateCompany: (data: Partial<Company>) => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;

  // Workspace state
  setOnboarded: (value: boolean) => Promise<void>;
  /** Local demo mode only — throws for signed-in workspaces (see Settings gating). */
  resetDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  // Stable empty state so server + first client render match (no hydration mismatch).
  const [db, setDb] = useState<Database>(() => createEmptyDatabase());
  const [ready, setReady] = useState(false);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [hasWorkspace, setHasWorkspace] = useState(true);
  const [adapter, setAdapter] = useState(localAdapter);

  // Pick an adapter based on session, then load (or seed) once on mount.
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const chosen = session ? supabaseAdapter : localAdapter;
      if (cancelled) return;
      setAdapter(chosen);
      setUsingSupabase(!!session);

      const loaded = await chosen.load();
      if (cancelled) return;
      setHasWorkspace(loaded !== null);
      setDb(loaded ?? createEmptyDatabase());
      setReady(true);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  function reportError(err: unknown) {
    toast.error(err instanceof Error ? err.message : "Something went wrong");
  }

  const value: StoreValue = {
    ready,
    usingSupabase,
    hasWorkspace,
    onboarded: db.onboarded,
    company: db.company,
    settings: db.settings,
    customers: db.customers,
    products: db.products,
    invoices: db.invoices,

    async createWorkspace(name) {
      try {
        await adapter.createWorkspace(name);
        const loaded = await adapter.load();
        setDb(loaded ?? createEmptyDatabase());
        setHasWorkspace(true);
      } catch (err) {
        reportError(err);
        throw err;
      }
    },

    async addCustomer(data) {
      try {
        const customer = await adapter.addCustomer(data);
        setDb((prev) => ({ ...prev, customers: [customer, ...prev.customers] }));
        return customer;
      } catch (err) {
        reportError(err);
        throw err;
      }
    },
    async updateCustomer(id, data) {
      try {
        await adapter.updateCustomer(id, data);
        setDb((prev) => ({
          ...prev,
          customers: prev.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      } catch (err) {
        reportError(err);
      }
    },
    async deleteCustomer(id) {
      try {
        await adapter.deleteCustomer(id);
        setDb((prev) => ({ ...prev, customers: prev.customers.filter((c) => c.id !== id) }));
      } catch (err) {
        reportError(err);
      }
    },
    getCustomer(id) {
      return id ? db.customers.find((c) => c.id === id) : undefined;
    },

    async addProduct(data) {
      try {
        const product = await adapter.addProduct(data);
        setDb((prev) => ({ ...prev, products: [product, ...prev.products] }));
        return product;
      } catch (err) {
        reportError(err);
        throw err;
      }
    },
    async updateProduct(id, data) {
      try {
        await adapter.updateProduct(id, data);
        setDb((prev) => ({
          ...prev,
          products: prev.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
      } catch (err) {
        reportError(err);
      }
    },
    async deleteProduct(id) {
      try {
        await adapter.deleteProduct(id);
        setDb((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
      } catch (err) {
        reportError(err);
      }
    },
    getProduct(id) {
      return id ? db.products.find((p) => p.id === id) : undefined;
    },

    peekInvoiceNumber() {
      return `${db.settings.invoicePrefix}${db.settings.nextInvoiceNumber}`;
    },
    async addInvoice(data) {
      try {
        const invoice = await adapter.addInvoice(data);
        setDb((prev) => ({
          ...prev,
          invoices: [invoice, ...prev.invoices],
          settings: { ...prev.settings, nextInvoiceNumber: prev.settings.nextInvoiceNumber + 1 },
        }));
        return invoice;
      } catch (err) {
        reportError(err);
        throw err;
      }
    },
    async updateInvoice(id, data) {
      try {
        await adapter.updateInvoice(id, data);
        setDb((prev) => ({
          ...prev,
          invoices: prev.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv,
          ),
        }));
      } catch (err) {
        reportError(err);
        throw err;
      }
    },
    async deleteInvoice(id) {
      try {
        await adapter.deleteInvoice(id);
        setDb((prev) => ({ ...prev, invoices: prev.invoices.filter((inv) => inv.id !== id) }));
      } catch (err) {
        reportError(err);
      }
    },
    getInvoice(id) {
      return id ? db.invoices.find((inv) => inv.id === id) : undefined;
    },
    async markInvoicePaid(id) {
      try {
        await adapter.markInvoicePaid(id);
        setDb((prev) => ({
          ...prev,
          invoices: prev.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: "paid", paidDate: todayISO(), updatedAt: new Date().toISOString() }
              : inv,
          ),
        }));
      } catch (err) {
        reportError(err);
      }
    },
    async duplicateInvoice(id) {
      try {
        const created = await adapter.duplicateInvoice(id);
        if (!created) return undefined;
        setDb((prev) => ({
          ...prev,
          invoices: [created, ...prev.invoices],
          settings: { ...prev.settings, nextInvoiceNumber: prev.settings.nextInvoiceNumber + 1 },
        }));
        return created;
      } catch (err) {
        reportError(err);
        return undefined;
      }
    },

    async updateCompany(data) {
      try {
        await adapter.updateCompany(data);
        setDb((prev) => ({ ...prev, company: { ...prev.company, ...data } }));
      } catch (err) {
        reportError(err);
      }
    },
    async updateSettings(data) {
      try {
        await adapter.updateSettings(data);
        setDb((prev) => ({ ...prev, settings: { ...prev.settings, ...data } }));
      } catch (err) {
        reportError(err);
      }
    },

    async setOnboarded(value) {
      try {
        await adapter.setOnboarded(value);
        setDb((prev) => ({ ...prev, onboarded: value }));
      } catch (err) {
        reportError(err);
      }
    },
    async resetDemoData() {
      try {
        await adapter.resetDemoData();
        const loaded = await adapter.load();
        setDb(loaded ?? createEmptyDatabase());
      } catch (err) {
        reportError(err);
      }
    },
    async clearAllData() {
      try {
        await adapter.clearAllData();
        const loaded = await adapter.load();
        setHasWorkspace(loaded !== null);
        setDb(loaded ?? createEmptyDatabase());
      } catch (err) {
        reportError(err);
      }
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <DataProvider>");
  return ctx;
}
