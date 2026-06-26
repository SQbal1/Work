"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Eye, Save, FileX } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { controlClass } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import {
  CompletenessChecklist,
  type ChecklistItem,
} from "@/components/invoices/CompletenessChecklist";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { uid } from "@/lib/id";
import { computeTotals, lineSubtotal } from "@/lib/calc";
import { vatRateForCategory } from "@/data/constants";
import { addDaysISO, todayISO, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { InvoiceLineItem, InvoiceStatus } from "@/types";

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
];

export function InvoiceBuilder({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const {
    customers,
    products,
    company,
    settings,
    getInvoice,
    addInvoice,
    updateInvoice,
    peekInvoiceNumber,
  } = useStore();

  const existing = invoiceId ? getInvoice(invoiceId) : undefined;
  const editing = !!existing;

  const [customerId, setCustomerId] = useState(existing?.customerId ?? "");
  const [issueDate, setIssueDate] = useState(existing?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(
    existing?.dueDate ?? addDaysISO(todayISO(), settings.defaultDueDays),
  );
  const [status, setStatus] = useState<InvoiceStatus>(existing?.status ?? "draft");
  const [items, setItems] = useState<InvoiceLineItem[]>(
    existing ? existing.items.map((i) => ({ ...i })) : [],
  );
  const [discountPercent, setDiscountPercent] = useState<number>(existing?.discountPercent ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? settings.defaultNotes);

  const number = existing?.number ?? peekInvoiceNumber();
  const activeProducts = products.filter((p) => p.active);
  const customer = customers.find((c) => c.id === customerId) ?? null;
  const totals = computeTotals(items, discountPercent);

  function addProductLine(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setItems((prev) => [
      ...prev,
      {
        id: uid("li_"),
        productId: p.id,
        name: p.name,
        quantity: 1,
        unitPrice: p.unitPrice,
        vatRate: vatRateForCategory(p.vatCategory),
      },
    ]);
  }

  function addCustomLine() {
    setItems((prev) => [
      ...prev,
      {
        id: uid("li_"),
        productId: null,
        name: "",
        quantity: 1,
        unitPrice: 0,
        vatRate: settings.defaultVatRate,
      },
    ]);
  }

  function updateItem(id: string, patch: Partial<InvoiceLineItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const checklist: ChecklistItem[] = [
    { label: "Customer selected", done: !!customerId },
    { label: "Invoice date added", done: !!issueDate },
    { label: "Due date added", done: !!dueDate },
    {
      label: "At least one line item",
      done: items.length > 0 && items.every((i) => i.name.trim() !== "" && i.quantity > 0),
    },
    { label: "Seller VAT number checked", done: company.vatNumber.trim() !== "" },
    {
      label: "Seller details checked",
      done: company.name.trim() !== "" && company.address.trim() !== "",
    },
  ];

  function handleSave() {
    if (!customerId) {
      toast.error("Select a customer first");
      return;
    }
    const validItems = items.filter((i) => i.name.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    const payload = {
      customerId,
      issueDate,
      dueDate,
      status,
      items: validItems,
      discountPercent,
      notes,
      paidDate: status === "paid" ? existing?.paidDate ?? todayISO() : null,
    };

    if (editing && existing) {
      updateInvoice(existing.id, payload);
      toast.success("Invoice updated");
      router.push(`/invoices/${existing.id}`);
    } else {
      const created = addInvoice(payload);
      toast.success("Invoice saved");
      router.push(`/invoices/${created.id}`);
    }
  }

  return (
    <div>
      <PageHeader
        title={editing ? `Edit ${number}` : "New invoice"}
        description="Build in the editor, validate readiness, and review the invoice preview."
        actions={
          <>
            <Link href="/invoices" className={buttonStyles("ghost", "md")}>
              Cancel
            </Link>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4" /> {editing ? "Save changes" : "Save invoice"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Builder */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Details" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Select
                id="inv-customer"
                label="Customer"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder={customers.length ? "Select a customer" : "No customers yet — add one first"}
                options={customers.map((c) => ({ value: c.id, label: c.company || c.name }))}
              />
              <Input id="inv-number" label="Invoice number" value={number} disabled />
              <Input
                id="inv-issue"
                type="date"
                label="Issue date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
              <Input
                id="inv-due"
                type="date"
                label="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Select
                id="inv-status"
                label="Payment status"
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                options={STATUS_OPTIONS}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Line items"
              subtitle="Add from your catalogue or create a custom line."
            />
            <CardBody>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  aria-label="Add from catalogue"
                  className="sm:w-72"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addProductLine(e.target.value);
                  }}
                  options={[
                    { value: "", label: "＋ Add from catalogue…" },
                    ...activeProducts.map((p) => ({
                      value: p.id,
                      label: `${p.name} · ${formatCurrency(p.unitPrice)}`,
                    })),
                  ]}
                />
                <Button variant="secondary" onClick={addCustomLine}>
                  <Plus className="h-4 w-4" /> Custom line
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={FileX}
                    title="No line items yet"
                    description="Add a service from your catalogue or create a custom line to get started."
                  />
                </div>
              ) : (
                <div className="mt-4">
                  {/* Desktop header */}
                  <div className="hidden grid-cols-12 gap-2 px-1 pb-2 font-mono text-xs font-semibold uppercase tracking-wide text-fog sm:grid">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Unit price</div>
                    <div className="col-span-2">VAT</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        onChange={(patch) => updateItem(item.id, patch)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Discount */}
              <div className="mt-4 flex items-center justify-end gap-3 border-t border-hairline pt-4">
                <label htmlFor="inv-discount" className="text-sm font-medium text-cloud">
                  Discount (%)
                </label>
                <input
                  id="inv-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discountPercent}
                  onChange={(e) =>
                    setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                  }
                  className={cn(controlClass, "h-10 w-24 text-right")}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notes" subtitle="Shown at the bottom of the invoice." />
            <CardBody>
              <Textarea
                id="inv-notes"
                value={notes}
                rows={3}
                placeholder="Payment instructions, thank-you note, terms…"
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardBody>
          </Card>
        </div>

        {/* Sidebar: summary + checklist */}
        <div className="space-y-6">
          <div className="space-y-6 lg:sticky lg:top-20">
            <Card>
              <CardHeader title="Summary" />
              <CardBody className="space-y-3">
                <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
                {discountPercent > 0 ? (
                  <SummaryRow
                    label={`Discount (${discountPercent}%)`}
                    value={`− ${formatCurrency(totals.discountAmount)}`}
                  />
                ) : null}
                <SummaryRow label="VAT" value={formatCurrency(totals.vatTotal)} />
                <div className="flex items-center justify-between border-t border-hairline pt-3 text-lg font-semibold text-bone">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
                <Button className="mt-2 w-full" onClick={handleSave}>
                  <Save className="h-4 w-4" /> {editing ? "Save changes" : "Save invoice"}
                </Button>
                <Link href="/invoices" className={buttonStyles("ghost", "md", "w-full")}>
                  Cancel
                </Link>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Invoice completeness" />
              <CardBody>
                <CompletenessChecklist items={checklist} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="mt-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-fog">
          <Eye className="h-4 w-4" /> Live preview
        </div>
        <div className="rounded-[4px] border border-hairline bg-ink p-3 sm:p-6">
          <div className="overflow-hidden rounded-[4px] border border-hairline">
            <InvoiceDocument
              company={company}
              customer={customer}
              number={number}
              issueDate={issueDate}
              dueDate={dueDate}
              status={status}
              items={items}
              discountPercent={discountPercent}
              notes={notes}
              currency={settings.currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-fog">
      <span>{label}</span>
      <span className="font-mono font-medium text-bone">{value}</span>
    </div>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block font-mono text-[11px] font-medium text-fog sm:hidden">{children}</span>;
}

function LineItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: InvoiceLineItem;
  onChange: (patch: Partial<InvoiceLineItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-[4px] border border-hairline bg-ink p-3 sm:grid-cols-12 sm:items-center sm:p-2">
      <div className="sm:col-span-4">
        <MiniLabel>Description</MiniLabel>
        <input
          aria-label="Description"
          placeholder="Item description"
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={cn(controlClass, "h-10")}
        />
      </div>
      <div className="sm:col-span-2">
        <MiniLabel>Qty</MiniLabel>
        <input
          aria-label="Quantity"
          type="number"
          min="0"
          step="1"
          inputMode="decimal"
          value={item.quantity}
          onChange={(e) => onChange({ quantity: Number(e.target.value) || 0 })}
          className={cn(controlClass, "h-10")}
        />
      </div>
      <div className="sm:col-span-2">
        <MiniLabel>Unit price</MiniLabel>
        <input
          aria-label="Unit price"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={item.unitPrice}
          onChange={(e) => onChange({ unitPrice: Number(e.target.value) || 0 })}
          className={cn(controlClass, "h-10")}
        />
      </div>
      <div className="sm:col-span-2">
        <MiniLabel>VAT</MiniLabel>
        <div className="relative">
          <select
            aria-label="VAT rate"
            value={String(item.vatRate)}
            onChange={(e) => onChange({ vatRate: Number(e.target.value) })}
            className={cn(controlClass, "h-10 appearance-none")}
          >
            <option value="0.15">VAT 15%</option>
            <option value="0">No VAT</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between sm:col-span-2 sm:justify-end sm:gap-2">
        <MiniLabel>Amount</MiniLabel>
        <span className="font-mono text-sm font-medium text-bone">{formatCurrency(lineSubtotal(item))}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove line"
          className="grid h-9 w-9 place-items-center rounded-[4px] text-fog transition hover:bg-mute-red/10 hover:text-mute-red"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
