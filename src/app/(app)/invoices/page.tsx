"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Copy,
  Trash2,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { getEffectiveStatus, STATUS_FILTERS } from "@/lib/status";
import { invoiceTotal } from "@/lib/metrics";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { EffectiveStatus, Invoice } from "@/types";

type FilterId = "all" | EffectiveStatus;

export default function InvoicesPage() {
  const { invoices, getCustomer, markInvoicePaid, duplicateInvoice, deleteInvoice } = useStore();
  const toast = useToast();

  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Invoice | null>(null);

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = { all: invoices.length, draft: 0, sent: 0, paid: 0, overdue: 0 };
    for (const inv of invoices) c[getEffectiveStatus(inv)] += 1;
    return c;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...invoices]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .filter((inv) => filter === "all" || getEffectiveStatus(inv) === filter)
      .filter((inv) => {
        if (!q) return true;
        const customer = getCustomer(inv.customerId);
        return [inv.number, customer?.name, customer?.company]
          .filter(Boolean)
          .some((f) => (f as string).toLowerCase().includes(q));
      });
  }, [invoices, filter, search, getCustomer]);

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Track every invoice from draft to paid."
        actions={
          <Link href="/invoices/new" className={buttonStyles("primary", "md")}>
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Create your first invoice — it only takes a minute."
          action={
            <Link href="/invoices/new" className={buttonStyles("primary", "md")}>
              <Plus className="h-4 w-4" /> New invoice
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          {/* Filters + search */}
          <div className="flex flex-col gap-3 border-b border-hairline p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-[4px] px-3 py-1.5 text-sm font-medium transition",
                    filter === f.id
                      ? "bg-signal text-ink"
                      : "text-fog hover:bg-white/[0.03] hover:text-cloud",
                  )}
                >
                  {f.label}
                  <span className={cn("ml-1.5 font-mono", filter === f.id ? "text-ink/70" : "text-fog")}>
                    {counts[f.id]}
                  </span>
                </button>
              ))}
            </div>
            <Input
              aria-label="Search invoices"
              placeholder="Search by customer or number…"
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No invoices match" description="Try a different filter or search term." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Invoice</Th>
                  <Th>Customer</Th>
                  <Th className="hidden md:table-cell">Issued</Th>
                  <Th className="hidden lg:table-cell">Due</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="text-center">Status</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((inv) => {
                  const customer = getCustomer(inv.customerId);
                  const isPaid = inv.status === "paid";
                  const isDraft = inv.status === "draft";
                  return (
                    <Tr key={inv.id} className="hover:bg-white/[0.03]">
                      <Td>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-mono font-medium text-signal hover:text-key-lime"
                        >
                          {inv.number}
                        </Link>
                      </Td>
                      <Td className="text-cloud">{customer?.company || customer?.name || "—"}</Td>
                      <Td className="hidden font-mono text-fog md:table-cell">{formatDate(inv.issueDate)}</Td>
                      <Td className="hidden font-mono text-fog lg:table-cell">{formatDate(inv.dueDate)}</Td>
                      <Td className="text-right font-mono font-medium text-bone">
                        {formatCurrency(invoiceTotal(inv))}
                      </Td>
                      <Td className="text-center">
                        <div className="flex justify-center">
                          <StatusBadge invoice={inv} />
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-1">
                          <IconAction href={`/invoices/${inv.id}`} label="View" icon={<Eye className="h-4 w-4" />} />
                          {!isPaid ? (
                            <IconAction
                              label="Mark as paid"
                              icon={<CheckCircle2 className="h-4 w-4" />}
                              onClick={() => {
                                markInvoicePaid(inv.id);
                                toast.success(`${inv.number} marked as paid`);
                              }}
                            />
                          ) : null}
                          <IconAction
                            label="Duplicate"
                            icon={<Copy className="h-4 w-4" />}
                            onClick={async () => {
                              const dup = await duplicateInvoice(inv.id);
                              if (dup) toast.success(`Duplicated as ${dup.number}`);
                            }}
                          />
                          {isDraft ? (
                            <IconAction
                              label="Delete draft"
                              icon={<Trash2 className="h-4 w-4" />}
                              danger
                              onClick={() => setDeleting(inv)}
                            />
                          ) : null}
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </Card>
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete draft invoice?"
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
                  deleteInvoice(deleting.id);
                  toast.success("Draft deleted");
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
          This permanently removes draft{" "}
          <span className="font-mono font-medium text-bone">{deleting?.number}</span>. Only drafts can be
          deleted — sent or paid invoices are kept for your records.
        </p>
      </Modal>
    </div>
  );
}

function IconAction({
  label,
  icon,
  onClick,
  href,
  danger,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const className = cn(
    "grid h-9 w-9 place-items-center rounded-[4px] text-fog transition hover:bg-white/[0.03]",
    danger ? "hover:text-mute-red" : "hover:text-bone",
  );
  if (href) {
    return (
      <Link href={href} title={label} aria-label={label} className={className}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={className}>
      {icon}
    </button>
  );
}
