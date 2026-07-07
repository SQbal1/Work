import type { Customer, Invoice, Product } from "@/types";
import type { NewCustomer, NewInvoice, NewProduct } from "@/lib/data/adapter";
import { loadDatabase } from "@/lib/storage";
import { createSeedDatabase } from "@/data/seed";

/**
 * Carrying a visitor's demo work into their brand-new signed-in workspace.
 *
 * The local demo always ships with seed data (the "Riyadh Advisory Co." sample
 * business). We must NOT import that fake sample into a real account — only the
 * rows the visitor actually created themselves. The seam that lets us tell them
 * apart cleanly: seed rows have fixed, known ids (`cus_najm`, `prd_strategy`,
 * `inv_1001`…) baked into src/data/seed.ts, while anything the user adds gets a
 * random `uid()` id. So "user-created" is simply "id not in the seed set."
 */

export interface DemoImportPlan {
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
}

/** Seed ids never change (they don't depend on the date), so compute once. */
let seedIdsCache: { customers: Set<string>; products: Set<string>; invoices: Set<string> } | null =
  null;

function seedIds() {
  if (!seedIdsCache) {
    const seed = createSeedDatabase();
    seedIdsCache = {
      customers: new Set(seed.customers.map((c) => c.id)),
      products: new Set(seed.products.map((p) => p.id)),
      invoices: new Set(seed.invoices.map((i) => i.id)),
    };
  }
  return seedIdsCache;
}

/**
 * The user-created demo rows worth importing, or null if there's nothing (no
 * demo db, or only the untouched sample data). Safe to call on the client only.
 */
export function planDemoImport(): DemoImportPlan | null {
  const db = loadDatabase();
  if (!db) return null;
  const ids = seedIds();
  const customers = db.customers.filter((c) => !ids.customers.has(c.id));
  const products = db.products.filter((p) => !ids.products.has(p.id));
  const invoices = db.invoices.filter((i) => !ids.invoices.has(i.id));
  if (customers.length === 0 && products.length === 0 && invoices.length === 0) return null;
  return { customers, products, invoices };
}

/** A one-line human summary, e.g. "3 customers, 1 service and 4 invoices". */
export function summarizeImportPlan(plan: DemoImportPlan): string {
  const parts: string[] = [];
  const n = (count: number, one: string, many: string) =>
    `${count} ${count === 1 ? one : many}`;
  if (plan.customers.length) parts.push(n(plan.customers.length, "customer", "customers"));
  if (plan.products.length) parts.push(n(plan.products.length, "service", "services"));
  if (plan.invoices.length) parts.push(n(plan.invoices.length, "invoice", "invoices"));
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

interface ImportApi {
  addCustomer: (data: NewCustomer) => Promise<Customer>;
  addProduct: (data: NewProduct) => Promise<Product>;
  addInvoice: (data: NewInvoice) => Promise<Invoice>;
}

/**
 * Replay the plan through the store's mutators (which now target Supabase).
 * Customers and products are inserted first so we can remap each invoice's
 * customer/product references from the old demo ids to the new workspace uuids;
 * any reference that doesn't map (e.g. an invoice that pointed at a sample
 * customer we didn't import) is nulled rather than left dangling, so an import
 * can never fail on a broken foreign key. Line items keep their own name/price,
 * so nulling a productId only drops the catalogue link, not the money.
 */
export async function runDemoImport(
  plan: DemoImportPlan,
  api: ImportApi,
): Promise<{ customers: number; products: number; invoices: number }> {
  const customerMap = new Map<string, string>();
  for (const c of plan.customers) {
    const created = await api.addCustomer({
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      vatNumber: c.vatNumber,
      address: c.address,
      notes: c.notes,
    });
    customerMap.set(c.id, created.id);
  }

  const productMap = new Map<string, string>();
  for (const p of plan.products) {
    const created = await api.addProduct({
      name: p.name,
      description: p.description,
      unitPrice: p.unitPrice,
      vatCategory: p.vatCategory,
      active: p.active,
    });
    productMap.set(p.id, created.id);
  }

  // Oldest first so the freshly-assigned invoice numbers ascend with time.
  const ordered = [...plan.invoices].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  let invoices = 0;
  for (const inv of ordered) {
    await api.addInvoice({
      customerId: inv.customerId ? customerMap.get(inv.customerId) ?? null : null,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      discountPercent: inv.discountPercent,
      notes: inv.notes,
      paidDate: inv.paidDate,
      items: inv.items.map((it) => ({
        ...it,
        productId: it.productId ? productMap.get(it.productId) ?? null : null,
      })),
    });
    invoices++;
  }

  return { customers: plan.customers.length, products: plan.products.length, invoices };
}
