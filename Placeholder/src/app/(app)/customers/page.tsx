"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2, Users, Mail, Phone, Download, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/ui/Motion";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { cn } from "@/lib/cn";
import { invoiceTotal } from "@/lib/metrics";
import { formatCurrency } from "@/lib/format";
import type { Customer } from "@/types";

type SortKey = "company" | "recent" | "revenue";

export default function CustomersPage() {
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [sort, setSort] = useState<SortKey>("company");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Open the add form when arriving from a "/customers#new" quick action.
  useEffect(() => {
    if (window.location.hash === "#new") {
      setAddOpen(true);
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const invoiceCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      if (inv.customerId) map.set(inv.customerId, (map.get(inv.customerId) ?? 0) + 1);
    }
    return map;
  }, [invoices]);

  // Billed revenue per customer (everything except drafts).
  const revenueByCustomer = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) {
      if (inv.customerId && inv.status !== "draft") {
        map.set(inv.customerId, (map.get(inv.customerId) ?? 0) + invoiceTotal(inv));
      }
    }
    return map;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const matched = !q
      ? customers
      : customers.filter((c) =>
          [c.name, c.company, c.email, c.phone].some((f) => f.toLowerCase().includes(q)),
        );

    const name = (c: Customer) => (c.company || c.name || "").toLowerCase();
    return [...matched].sort((a, b) => {
      if (sort === "revenue") {
        return (revenueByCustomer.get(b.id) ?? 0) - (revenueByCustomer.get(a.id) ?? 0);
      }
      if (sort === "recent") {
        return a.createdAt < b.createdAt ? 1 : -1;
      }
      return name(a).localeCompare(name(b));
    });
  }, [customers, debouncedSearch, sort, revenueByCustomer]);

  const selectedRows = filtered.filter((c) => selected.has(c.id));
  const allSelected = filtered.length > 0 && selectedRows.length === filtered.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((c) => c.id)),
    );
  }

  function exportCsv(rows: Customer[]) {
    const headers = ["Name", "Company", "Email", "Phone", "VAT number", "Address", "Invoices", "Revenue (SAR)"];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    for (const c of rows) {
      lines.push(
        [
          c.name,
          c.company,
          c.email,
          c.phone,
          c.vatNumber,
          c.address,
          invoiceCount.get(c.id) ?? 0,
          revenueByCustomer.get(c.id) ?? 0,
        ]
          .map(esc)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} ${rows.length === 1 ? "customer" : "customers"}`);
  }

  function bulkDelete() {
    const ids = [...selected];
    ids.forEach((id) => deleteCustomer(id));
    toast.success(`Deleted ${ids.length} ${ids.length === 1 ? "customer" : "customers"}`);
    setSelected(new Set());
    setBulkDeleteOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Save customer details once and reuse them on every invoice."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add customer
          </Button>
        }
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start sending invoices in seconds."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add customer
            </Button>
          }
        />
      ) : (
        <FadeIn>
        <Card className="overflow-hidden">
          {selected.size > 0 ? (
            <div className="flex flex-wrap items-center gap-3 border-b border-hairline bg-signal/[0.06] p-3">
              <span className="text-sm font-medium text-bone">{selected.size} selected</span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => exportCsv(selectedRows)}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
                <Button variant="danger" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  aria-label="Clear selection"
                  className="grid h-9 w-9 place-items-center rounded-[10px] text-fog transition hover:bg-white/[0.03] hover:text-bone"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 border-b border-hairline p-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                aria-label="Search customers"
                placeholder="Search by name, company, or email…"
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select
                aria-label="Sort customers"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="sm:w-52"
                options={[
                  { value: "company", label: "Sort: Company (A–Z)" },
                  { value: "recent", label: "Sort: Recently added" },
                  { value: "revenue", label: "Sort: Revenue (high→low)" },
                ]}
              />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No matches"
                description="Try a different search term."
                action={
                  search ? (
                    <Button variant="secondary" onClick={() => setSearch("")}>
                      Clear search
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all customers"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedRows.length > 0 && !allSelected;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 cursor-pointer rounded border-hairline bg-ink accent-signal"
                    />
                  </Th>
                  <Th>Customer</Th>
                  <Th className="hidden md:table-cell">Contact</Th>
                  <Th className="hidden lg:table-cell">VAT number</Th>
                  <Th className="text-center">Invoices</Th>
                  <Th className="hidden text-right sm:table-cell">Revenue</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((c) => (
                  <Tr
                    key={c.id}
                    className={cn(
                      "transition-colors",
                      selected.has(c.id) ? "bg-signal/[0.05]" : "hover:bg-white/[0.03]",
                    )}
                  >
                    <Td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${c.company || c.name}`}
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        className="h-4 w-4 cursor-pointer rounded border-hairline bg-ink accent-signal"
                      />
                    </Td>
                    <Td>
                      <button
                        onClick={() => setViewing(c)}
                        className="flex items-center gap-3 text-left"
                      >
                        <Avatar name={c.company || c.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block font-medium text-bone">
                            {c.company || c.name}
                          </span>
                          {c.company ? (
                            <span className="block text-xs text-fog">{c.name}</span>
                          ) : null}
                        </span>
                      </button>
                    </Td>
                    <Td className="hidden md:table-cell">
                      <span className="block text-cloud">{c.email || "—"}</span>
                      <span className="block text-xs text-fog">{c.phone}</span>
                    </Td>
                    <Td className="hidden font-mono text-xs text-fog lg:table-cell">
                      {c.vatNumber || "—"}
                    </Td>
                    <Td className="text-center font-mono text-cloud">{invoiceCount.get(c.id) ?? 0}</Td>
                    <Td className="hidden text-right font-mono font-medium text-bone nums-tabular sm:table-cell">
                      {formatCurrency(revenueByCustomer.get(c.id) ?? 0)}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <RowButton label="View" onClick={() => setViewing(c)} icon={<Eye className="h-4 w-4" />} />
                        <RowButton label="Edit" onClick={() => setEditing(c)} icon={<Pencil className="h-4 w-4" />} />
                        <RowButton
                          label="Delete"
                          onClick={() => setDeleting(c)}
                          icon={<Trash2 className="h-4 w-4" />}
                          danger
                        />
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
        </FadeIn>
      )}

      {/* Add */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add customer"
        description="These details auto-fill on invoices."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-customer">
              Save customer
            </Button>
          </>
        }
      >
        <CustomerForm
          formId="add-customer"
          onSubmit={(values) => {
            addCustomer(values);
            setAddOpen(false);
            toast.success("Customer added");
          }}
        />
      </Modal>

      {/* Edit */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit customer"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-customer">
              Save changes
            </Button>
          </>
        }
      >
        {editing ? (
          <CustomerForm
            formId="edit-customer"
            initial={editing}
            onSubmit={(values) => {
              updateCustomer(editing.id, values);
              setEditing(null);
              toast.success("Customer updated");
            }}
          />
        ) : null}
      </Modal>

      {/* View */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Customer details" size="md">
        {viewing ? (
          <CustomerDetails
            customer={viewing}
            count={invoiceCount.get(viewing.id) ?? 0}
            billed={invoices
              .filter((i) => i.customerId === viewing.id && i.status === "paid")
              .reduce((s, i) => s + invoiceTotal(i), 0)}
            onEdit={() => {
              setEditing(viewing);
              setViewing(null);
            }}
          />
        ) : null}
      </Modal>

      {/* Delete */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete customer?"
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
                  deleteCustomer(deleting.id);
                  toast.success("Customer deleted");
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
          This removes <span className="font-medium text-bone">{deleting?.company || deleting?.name}</span> from
          your customer list. Existing invoices are not deleted.
        </p>
      </Modal>

      {/* Bulk delete */}
      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title={`Delete ${selected.size} ${selected.size === 1 ? "customer" : "customers"}?`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={bulkDelete}>
              <Trash2 className="h-4 w-4" /> Delete {selected.size}
            </Button>
          </>
        }
      >
        <p className="text-sm text-fog">
          This removes the selected {selected.size === 1 ? "customer" : "customers"} from your list.
          Existing invoices are not deleted. Consider exporting a CSV first.
        </p>
      </Modal>
    </div>
  );
}

function RowButton({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-[10px] text-fog transition hover:bg-white/[0.03] ${
        danger ? "hover:text-mute-red" : "hover:text-bone"
      }`}
    >
      {icon}
    </button>
  );
}

function CustomerDetails({
  customer,
  count,
  billed,
  onEdit,
}: {
  customer: Customer;
  count: number;
  billed: number;
  onEdit: () => void;
}) {
  const rows: { label: string; value: string; icon?: React.ReactNode }[] = [
    { label: "Email", value: customer.email || "—", icon: <Mail className="h-4 w-4 text-fog" /> },
    { label: "Phone", value: customer.phone || "—", icon: <Phone className="h-4 w-4 text-fog" /> },
    { label: "VAT number", value: customer.vatNumber || "—" },
    { label: "Address", value: customer.address || "—" },
    { label: "Notes", value: customer.notes || "—" },
  ];
  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar name={customer.company || customer.name} size="lg" />
        <div>
          <h3 className="font-semibold text-bone">{customer.company || customer.name}</h3>
          {customer.company ? <p className="text-sm text-fog">{customer.name}</p> : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[10px] border border-hairline bg-ink p-3">
          <div className="text-xs text-fog">Invoices</div>
          <div className="font-mono text-lg font-semibold text-bone">{count}</div>
        </div>
        <div className="rounded-[10px] border border-hairline bg-ink p-3">
          <div className="text-xs text-fog">Paid to date</div>
          <div className="font-mono text-lg font-semibold text-bone">{formatCurrency(billed)}</div>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex gap-3 text-sm">
            <dt className="w-28 shrink-0 text-fog">{r.label}</dt>
            <dd className="flex items-center gap-1.5 text-cloud">
              {r.icon}
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onEdit}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
        <Link href="/invoices/new" className={buttonStyles("primary", "md")}>
          <Plus className="h-4 w-4" /> New invoice
        </Link>
      </div>
    </div>
  );
}
