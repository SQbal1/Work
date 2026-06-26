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
  InvoiceLineItem,
  Product,
  Settings,
} from "@/types";
import { loadDatabase, saveDatabase } from "./storage";
import { createEmptyDatabase, createSeedDatabase } from "@/data/seed";
import { uid } from "./id";
import { addDaysISO, todayISO } from "./format";

/**
 * The single client-side data store for the whole app. It loads from
 * localStorage on mount, seeds demo data on first run, and persists every
 * change. Components read state and call the mutators — no Redux, no extra
 * libraries. To move to a real backend, swap the bodies here for API calls.
 */

type NewCustomer = Omit<Customer, "id" | "createdAt">;
type NewProduct = Omit<Product, "id" | "createdAt">;
type NewInvoice = Omit<Invoice, "id" | "number" | "createdAt" | "updatedAt">;

interface StoreValue {
  ready: boolean;
  onboarded: boolean;
  company: Company;
  settings: Settings;
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];

  // Customers
  addCustomer: (data: NewCustomer) => Customer;
  updateCustomer: (id: string, data: Partial<NewCustomer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string | null) => Customer | undefined;

  // Products
  addProduct: (data: NewProduct) => Product;
  updateProduct: (id: string, data: Partial<NewProduct>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string | null) => Product | undefined;

  // Invoices
  peekInvoiceNumber: () => string;
  addInvoice: (data: NewInvoice) => Invoice;
  updateInvoice: (id: string, data: Partial<Omit<Invoice, "id">>) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string | null) => Invoice | undefined;
  markInvoicePaid: (id: string) => void;
  duplicateInvoice: (id: string) => Invoice | undefined;

  // Company & settings
  updateCompany: (data: Partial<Company>) => void;
  updateSettings: (data: Partial<Settings>) => void;

  // Workspace
  setOnboarded: (value: boolean) => void;
  resetDemoData: () => void;
  clearAllData: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  // Stable empty state so server + first client render match (no hydration mismatch).
  const [db, setDb] = useState<Database>(() => createEmptyDatabase());
  const [ready, setReady] = useState(false);

  // Load (or seed) once on mount.
  useEffect(() => {
    const existing = loadDatabase();
    setDb(existing ?? createSeedDatabase());
    setReady(true);
  }, []);

  // Persist on every change once we're past the initial load.
  useEffect(() => {
    if (ready) saveDatabase(db);
  }, [db, ready]);

  const value: StoreValue = {
    ready,
    onboarded: db.onboarded,
    company: db.company,
    settings: db.settings,
    customers: db.customers,
    products: db.products,
    invoices: db.invoices,

    addCustomer(data) {
      const customer: Customer = { ...data, id: uid("cus_"), createdAt: new Date().toISOString() };
      setDb((prev) => ({ ...prev, customers: [customer, ...prev.customers] }));
      return customer;
    },
    updateCustomer(id, data) {
      setDb((prev) => ({
        ...prev,
        customers: prev.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
    },
    deleteCustomer(id) {
      setDb((prev) => ({ ...prev, customers: prev.customers.filter((c) => c.id !== id) }));
    },
    getCustomer(id) {
      return id ? db.customers.find((c) => c.id === id) : undefined;
    },

    addProduct(data) {
      const product: Product = { ...data, id: uid("prd_"), createdAt: new Date().toISOString() };
      setDb((prev) => ({ ...prev, products: [product, ...prev.products] }));
      return product;
    },
    updateProduct(id, data) {
      setDb((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    },
    deleteProduct(id) {
      setDb((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
    },
    getProduct(id) {
      return id ? db.products.find((p) => p.id === id) : undefined;
    },

    peekInvoiceNumber() {
      return `${db.settings.invoicePrefix}${db.settings.nextInvoiceNumber}`;
    },
    addInvoice(data) {
      const now = new Date().toISOString();
      let created!: Invoice;
      setDb((prev) => {
        const number = `${prev.settings.invoicePrefix}${prev.settings.nextInvoiceNumber}`;
        created = { ...data, id: uid("inv_"), number, createdAt: now, updatedAt: now };
        return {
          ...prev,
          invoices: [created, ...prev.invoices],
          settings: { ...prev.settings, nextInvoiceNumber: prev.settings.nextInvoiceNumber + 1 },
        };
      });
      return created;
    },
    updateInvoice(id, data) {
      setDb((prev) => ({
        ...prev,
        invoices: prev.invoices.map((inv) =>
          inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv,
        ),
      }));
    },
    deleteInvoice(id) {
      setDb((prev) => ({ ...prev, invoices: prev.invoices.filter((inv) => inv.id !== id) }));
    },
    getInvoice(id) {
      return id ? db.invoices.find((inv) => inv.id === id) : undefined;
    },
    markInvoicePaid(id) {
      setDb((prev) => ({
        ...prev,
        invoices: prev.invoices.map((inv) =>
          inv.id === id
            ? { ...inv, status: "paid", paidDate: todayISO(), updatedAt: new Date().toISOString() }
            : inv,
        ),
      }));
    },
    duplicateInvoice(id) {
      const source = db.invoices.find((inv) => inv.id === id);
      if (!source) return undefined;
      const now = new Date().toISOString();
      let created!: Invoice;
      setDb((prev) => {
        const number = `${prev.settings.invoicePrefix}${prev.settings.nextInvoiceNumber}`;
        const items: InvoiceLineItem[] = source.items.map((it) => ({ ...it, id: uid("li_") }));
        created = {
          ...source,
          id: uid("inv_"),
          number,
          status: "draft",
          issueDate: todayISO(),
          dueDate: addDaysISO(todayISO(), prev.settings.defaultDueDays),
          paidDate: null,
          items,
          createdAt: now,
          updatedAt: now,
        };
        return {
          ...prev,
          invoices: [created, ...prev.invoices],
          settings: { ...prev.settings, nextInvoiceNumber: prev.settings.nextInvoiceNumber + 1 },
        };
      });
      return created;
    },

    updateCompany(data) {
      setDb((prev) => ({ ...prev, company: { ...prev.company, ...data } }));
    },
    updateSettings(data) {
      setDb((prev) => ({ ...prev, settings: { ...prev.settings, ...data } }));
    },

    setOnboarded(value) {
      setDb((prev) => ({ ...prev, onboarded: value }));
    },
    resetDemoData() {
      setDb(createSeedDatabase());
    },
    clearAllData() {
      setDb(createEmptyDatabase());
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <DataProvider>");
  return ctx;
}
