import type { DataAdapter } from "./adapter";
import { createWorkspace, deleteAllWorkspaceData, getWorkspaceData } from "@/lib/actions/workspace";
import { setOnboarded, updateCompany, updateSettings } from "@/lib/actions/company";
import { createCustomer, deleteCustomer, updateCustomer } from "@/lib/actions/customers";
import { createProduct, deleteProduct, updateProduct } from "@/lib/actions/products";
import {
  createInvoice,
  deleteInvoice,
  duplicateInvoice,
  markInvoicePaid,
  updateInvoice,
} from "@/lib/actions/invoices";

export const supabaseAdapter: DataAdapter = {
  load: getWorkspaceData,
  async createWorkspace(name) {
    await createWorkspace(name);
  },

  addCustomer: createCustomer,
  updateCustomer,
  deleteCustomer,

  addProduct: createProduct,
  updateProduct,
  deleteProduct,

  addInvoice: createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoicePaid,
  duplicateInvoice,

  updateCompany,
  updateSettings,
  setOnboarded,

  async resetDemoData() {
    throw new Error("Restoring demo data isn't available for a signed-in workspace.");
  },
  clearAllData: deleteAllWorkspaceData,
};
