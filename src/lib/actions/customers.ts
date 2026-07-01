"use server";

import type { Customer } from "@/types";
import type { TablesUpdate } from "@/types/supabase";
import { requireWorkspaceId } from "./workspace";
import { rowToCustomer } from "./mappers";

type NewCustomer = Omit<Customer, "id" | "createdAt">;

export async function createCustomer(data: NewCustomer): Promise<Customer> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const { data: row, error } = await supabase
    .from("customers")
    .insert({
      workspace_id: workspaceId,
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      vat_number: data.vatNumber,
      address: data.address,
      notes: data.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCustomer(row);
}

export async function updateCustomer(id: string, data: Partial<NewCustomer>): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const patch: TablesUpdate<"customers"> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.company !== undefined) patch.company = data.company;
  if (data.email !== undefined) patch.email = data.email;
  if (data.phone !== undefined) patch.phone = data.phone;
  if (data.vatNumber !== undefined) patch.vat_number = data.vatNumber;
  if (data.address !== undefined) patch.address = data.address;
  if (data.notes !== undefined) patch.notes = data.notes;

  const { error } = await supabase
    .from("customers")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) throw error;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const { error } = await supabase.from("customers").delete().eq("id", id).eq("workspace_id", workspaceId);
  if (error) throw error;
}
