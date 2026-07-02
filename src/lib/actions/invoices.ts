"use server";

import type { Invoice } from "@/types";
import type { TablesUpdate } from "@/types/supabase";
import { requireWorkspaceId } from "./workspace";
import { rowToInvoice } from "./mappers";

type NewInvoice = Omit<Invoice, "id" | "number" | "createdAt" | "updatedAt">;

function toRpcItems(items: Invoice["items"]) {
  return items.map((item, index) => ({
    product_id: item.productId,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    vat_rate: item.vatRate,
    sort_order: index,
  }));
}

export async function createInvoice(data: NewInvoice): Promise<Invoice> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const id = crypto.randomUUID();

  const { data: row, error } = await supabase.rpc("create_invoice", {
    p_workspace_id: workspaceId,
    p_id: id,
    // Postgres accepts null here (customer_id is a nullable FK) — the
    // generated RPC arg type just doesn't express that.
    p_customer_id: data.customerId as string,
    p_issue_date: data.issueDate,
    p_due_date: data.dueDate,
    p_status: data.status,
    p_discount_percent: data.discountPercent,
    p_notes: data.notes,
    p_items: toRpcItems(data.items),
  });
  if (error) throw error;

  const { data: itemRows, error: itemsError } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", id)
    .order("sort_order", { ascending: true });
  if (itemsError) throw itemsError;

  return rowToInvoice({ ...row, invoice_line_items: itemRows });
}

/** Financial fields that must freeze once an invoice has been ZATCA-signed — a signed
 *  hash/signature that could silently drift from the invoice content is worse than no
 *  signature at all. See src/lib/zatca/. */
const ZATCA_FROZEN_FIELDS = ["customerId", "issueDate", "discountPercent", "items"] as const;

async function assertNotZatcaSigned(
  supabase: Awaited<ReturnType<typeof requireWorkspaceId>>["supabase"],
  workspaceId: string,
  id: string,
) {
  const { data: row, error } = await supabase
    .from("invoices")
    .select("zatca_signed_at")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  if (row?.zatca_signed_at) {
    throw new Error("This invoice has been ZATCA-signed and can no longer be changed.");
  }
}

export async function updateInvoice(id: string, data: Partial<Omit<Invoice, "id">>): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();

  if (ZATCA_FROZEN_FIELDS.some((field) => data[field] !== undefined)) {
    await assertNotZatcaSigned(supabase, workspaceId, id);
  }

  const patch: TablesUpdate<"invoices"> = {};
  if (data.customerId !== undefined) patch.customer_id = data.customerId;
  if (data.issueDate !== undefined) patch.issue_date = data.issueDate;
  if (data.dueDate !== undefined) patch.due_date = data.dueDate;
  if (data.status !== undefined) patch.status = data.status;
  if (data.discountPercent !== undefined) patch.discount_percent = data.discountPercent;
  if (data.notes !== undefined) patch.notes = data.notes;
  if (data.paidDate !== undefined) patch.paid_date = data.paidDate;

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from("invoices")
      .update(patch)
      .eq("id", id)
      .eq("workspace_id", workspaceId);
    if (error) throw error;
  }

  if (data.items) {
    const { error: deleteError } = await supabase.from("invoice_line_items").delete().eq("invoice_id", id);
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase.from("invoice_line_items").insert(
      toRpcItems(data.items).map((item) => ({ ...item, invoice_id: id })),
    );
    if (insertError) throw insertError;
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  await assertNotZatcaSigned(supabase, workspaceId, id);
  const { error } = await supabase.from("invoices").delete().eq("id", id).eq("workspace_id", workspaceId);
  if (error) throw error;
}

export async function markInvoicePaid(id: string): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const paidDate = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_date: paidDate })
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) throw error;
}

export async function duplicateInvoice(sourceId: string): Promise<Invoice | undefined> {
  const { supabase, workspaceId } = await requireWorkspaceId();

  const { data: source, error } = await supabase
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("id", sourceId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  if (!source) return undefined;

  const { data: settingsRow, error: settingsError } = await supabase
    .from("settings")
    .select("default_due_days")
    .eq("workspace_id", workspaceId)
    .single();
  if (settingsError) throw settingsError;

  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + settingsRow.default_due_days);

  const sourceInvoice = rowToInvoice(source);

  return createInvoice({
    customerId: sourceInvoice.customerId,
    issueDate: today.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    status: "draft",
    items: sourceInvoice.items,
    discountPercent: 0,
    notes: sourceInvoice.notes,
    paidDate: null,
  });
}
