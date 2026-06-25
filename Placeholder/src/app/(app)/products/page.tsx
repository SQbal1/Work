"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { ProductForm } from "@/components/products/ProductForm";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { formatCurrency } from "@/lib/format";
import { vatCategoryLabel } from "@/data/constants";
import type { Product } from "@/types";

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  useEffect(() => {
    if (window.location.hash === "#new") {
      setAddOpen(true);
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.description].some((f) => f.toLowerCase().includes(q)),
    );
  }, [products, search]);

  return (
    <div>
      <PageHeader
        title="Products & Services"
        description="Build a catalogue of what you sell so invoicing is one click."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products or services yet"
          description="Add the things you sell — they become reusable line items on invoices."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-hairline p-3">
            <Input
              aria-label="Search products"
              placeholder="Search products & services…"
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No matches" description="Try a different search term." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Item</Th>
                  <Th className="hidden md:table-cell">VAT category</Th>
                  <Th className="text-right">Unit price</Th>
                  <Th className="text-center">Status</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((p) => (
                  <Tr key={p.id} className="hover:bg-white/[0.03]">
                    <Td>
                      <div className="font-medium text-bone">{p.name}</div>
                      {p.description ? (
                        <div className="max-w-md truncate text-xs text-fog">{p.description}</div>
                      ) : null}
                    </Td>
                    <Td className="hidden text-cloud md:table-cell">
                      {vatCategoryLabel(p.vatCategory)}
                    </Td>
                    <Td className="text-right font-mono font-medium text-bone">
                      {formatCurrency(p.unitPrice)}
                    </Td>
                    <Td className="text-center">
                      <button
                        onClick={() => {
                          updateProduct(p.id, { active: !p.active });
                          toast.info(p.active ? "Marked inactive" : "Marked active");
                        }}
                        title="Toggle status"
                      >
                        <Badge tone={p.active ? "green" : "gray"} dot>
                          {p.active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          title="Edit"
                          aria-label="Edit"
                          className="grid h-9 w-9 place-items-center rounded-[4px] text-fog transition hover:bg-white/[0.03] hover:text-bone"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(p)}
                          title="Delete"
                          aria-label="Delete"
                          className="grid h-9 w-9 place-items-center rounded-[4px] text-fog transition hover:bg-mute-red/10 hover:text-mute-red"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Add */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add product / service"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-product">
              Save item
            </Button>
          </>
        }
      >
        <ProductForm
          formId="add-product"
          onSubmit={(values) => {
            addProduct(values);
            setAddOpen(false);
            toast.success("Item added");
          }}
        />
      </Modal>

      {/* Edit */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit product / service"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-product">
              Save changes
            </Button>
          </>
        }
      >
        {editing ? (
          <ProductForm
            formId="edit-product"
            initial={editing}
            onSubmit={(values) => {
              updateProduct(editing.id, values);
              setEditing(null);
              toast.success("Item updated");
            }}
          />
        ) : null}
      </Modal>

      {/* Delete */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete item?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleting) {
                  deleteProduct(deleting.id);
                  toast.success("Item deleted");
                }
                setDeleting(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-fog">
          This removes <span className="font-medium text-bone">{deleting?.name}</span> from your
          catalogue. Invoices that already use it are not affected.
        </p>
      </Modal>
    </div>
  );
}
