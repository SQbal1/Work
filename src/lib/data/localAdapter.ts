import type { Customer, Invoice, InvoiceLineItem, Product } from "@/types";
import type { DataAdapter } from "./adapter";
import { loadDatabase, saveDatabase } from "@/lib/storage";
import { createEmptyDatabase, createSeedDatabase } from "@/data/seed";
import { uid } from "@/lib/id";
import { addDaysISO, todayISO } from "@/lib/format";

/** Read-modify-write against localStorage, seeding demo data on first run. */
function readOrSeed() {
  return loadDatabase() ?? createSeedDatabase();
}

export const localAdapter: DataAdapter = {
  async load() {
    return readOrSeed();
  },

  async createWorkspace() {
    // no-op — local mode has no server-side workspace to create
  },

  async addCustomer(data) {
    const db = readOrSeed();
    const customer: Customer = { ...data, id: uid("cus_"), createdAt: new Date().toISOString() };
    db.customers = [customer, ...db.customers];
    saveDatabase(db);
    return customer;
  },
  async updateCustomer(id, data) {
    const db = readOrSeed();
    db.customers = db.customers.map((c) => (c.id === id ? { ...c, ...data } : c));
    saveDatabase(db);
  },
  async deleteCustomer(id) {
    const db = readOrSeed();
    db.customers = db.customers.filter((c) => c.id !== id);
    saveDatabase(db);
  },

  async addProduct(data) {
    const db = readOrSeed();
    const product: Product = { ...data, id: uid("prd_"), createdAt: new Date().toISOString() };
    db.products = [product, ...db.products];
    saveDatabase(db);
    return product;
  },
  async updateProduct(id, data) {
    const db = readOrSeed();
    db.products = db.products.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveDatabase(db);
  },
  async deleteProduct(id) {
    const db = readOrSeed();
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);
  },

  async addInvoice(data) {
    const db = readOrSeed();
    const now = new Date().toISOString();
    const number = `${db.settings.invoicePrefix}${db.settings.nextInvoiceNumber}`;
    const invoice: Invoice = { ...data, id: uid("inv_"), number, createdAt: now, updatedAt: now };
    db.invoices = [invoice, ...db.invoices];
    db.settings = { ...db.settings, nextInvoiceNumber: db.settings.nextInvoiceNumber + 1 };
    saveDatabase(db);
    return invoice;
  },
  async updateInvoice(id, data) {
    const db = readOrSeed();
    db.invoices = db.invoices.map((inv) =>
      inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv,
    );
    saveDatabase(db);
  },
  async deleteInvoice(id) {
    const db = readOrSeed();
    db.invoices = db.invoices.filter((inv) => inv.id !== id);
    saveDatabase(db);
  },
  async markInvoicePaid(id) {
    const db = readOrSeed();
    db.invoices = db.invoices.map((inv) =>
      inv.id === id
        ? { ...inv, status: "paid", paidDate: todayISO(), updatedAt: new Date().toISOString() }
        : inv,
    );
    saveDatabase(db);
  },
  async duplicateInvoice(id) {
    const db = readOrSeed();
    const source = db.invoices.find((inv) => inv.id === id);
    if (!source) return undefined;
    const now = new Date().toISOString();
    const number = `${db.settings.invoicePrefix}${db.settings.nextInvoiceNumber}`;
    const items: InvoiceLineItem[] = source.items.map((it) => ({ ...it, id: uid("li_") }));
    const invoice: Invoice = {
      ...source,
      id: uid("inv_"),
      number,
      status: "draft",
      issueDate: todayISO(),
      dueDate: addDaysISO(todayISO(), db.settings.defaultDueDays),
      paidDate: null,
      items,
      createdAt: now,
      updatedAt: now,
    };
    db.invoices = [invoice, ...db.invoices];
    db.settings = { ...db.settings, nextInvoiceNumber: db.settings.nextInvoiceNumber + 1 };
    saveDatabase(db);
    return invoice;
  },

  async updateCompany(data) {
    const db = readOrSeed();
    db.company = { ...db.company, ...data };
    saveDatabase(db);
  },
  async updateSettings(data) {
    const db = readOrSeed();
    db.settings = { ...db.settings, ...data };
    saveDatabase(db);
  },
  async setOnboarded(value) {
    const db = readOrSeed();
    db.onboarded = value;
    saveDatabase(db);
  },

  async resetDemoData() {
    saveDatabase(createSeedDatabase());
  },
  async clearAllData() {
    saveDatabase(createEmptyDatabase());
  },
};
