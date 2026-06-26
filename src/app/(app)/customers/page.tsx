"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2, Users, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { invoiceTotal } from "@/lib/metrics";
import { formatCurrency } from "@/lib/format";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.company, c.email, c.phone].some((f) => f.toLowerCase().includes(q)),
    );
  }, [customers, search]);

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
        <Card className="overflow-hidden">
          <div className="border-b border-hairline p-3">
            <Input
              aria-label="Search customers"
              placeholder="Search by name, company, or email…"
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
                  <Th>Customer</Th>
                  <Th className="hidden md:table-cell">Contact</Th>
                  <Th className="hidden lg:table-cell">VAT number</Th>
                  <Th className="text-center">Invoices</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((c) => (
                  <Tr key={c.id} className="hover:bg-white/[0.03]">
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
      className={`grid h-9 w-9 place-items-center rounded-[4px] text-fog transition hover:bg-white/[0.03] ${
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
        <div className="rounded-[4px] border border-hairline bg-ink p-3">
          <div className="text-xs text-fog">Invoices</div>
          <div className="font-mono text-lg font-semibold text-bone">{count}</div>
        </div>
        <div className="rounded-[4px] border border-hairline bg-ink p-3">
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
