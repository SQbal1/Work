"use server";

import type { Product } from "@/types";
import type { TablesUpdate } from "@/types/supabase";
import { requireWorkspaceId } from "./workspace";
import { rowToProduct } from "./mappers";

type NewProduct = Omit<Product, "id" | "createdAt">;

export async function createProduct(data: NewProduct): Promise<Product> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const { data: row, error } = await supabase
    .from("products")
    .insert({
      workspace_id: workspaceId,
      name: data.name,
      description: data.description,
      unit_price: data.unitPrice,
      vat_category: data.vatCategory,
      active: data.active,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(row);
}

export async function updateProduct(id: string, data: Partial<NewProduct>): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const patch: TablesUpdate<"products"> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.description !== undefined) patch.description = data.description;
  if (data.unitPrice !== undefined) patch.unit_price = data.unitPrice;
  if (data.vatCategory !== undefined) patch.vat_category = data.vatCategory;
  if (data.active !== undefined) patch.active = data.active;

  const { error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { supabase, workspaceId } = await requireWorkspaceId();
  const { error } = await supabase.from("products").delete().eq("id", id).eq("workspace_id", workspaceId);
  if (error) throw error;
}
