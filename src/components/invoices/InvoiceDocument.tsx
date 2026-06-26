import type { Company, Customer, InvoiceLineItem, InvoiceStatus } from "@/types";
import { computeTotals, lineSubtotal } from "@/lib/calc";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

export interface InvoiceDocumentProps {
  company: Company;
  customer: Customer | null;
  number: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  discountPercent: number;
  notes: string;
  currency?: string;
}

/**
 * The clean, printable invoice layout. Shared by the builder's live preview and
 * the standalone invoice preview page so they can never drift apart.
 */
export function InvoiceDocument(props: InvoiceDocumentProps) {
  const { company, customer, number, issueDate, dueDate, status, items, discountPercent, notes } = props;
  const currency = props.currency ?? brand.currency;
  const totals = computeTotals(items, discountPercent);
  const statusMeta = STATUS_META[status];

  return (
    <div className="print-area mx-auto w-full max-w-3xl bg-white p-6 text-slate-800 sm:p-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[4px] bg-[#121317]">
            <span className="h-3 w-3 rounded-[2px] bg-[#a8ff53]" />
          </span>
          <div>
            <div className="text-lg font-semibold text-slate-900">{company.name || "Your Company"}</div>
            <div className="text-sm text-slate-500">{company.legalName || company.city || brand.country}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tracking-tight text-slate-900">TAX INVOICE</div>
          <div className="mt-1 font-mono text-sm text-slate-500">{number}</div>
          <span
            className={cn(
              "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
              status === "paid"
                ? "bg-accent-50 text-accent-700 ring-accent-200"
                : status === "sent"
                  ? "bg-blue-50 text-blue-700 ring-blue-200"
                  : "bg-slate-100 text-slate-600 ring-slate-200",
            )}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Parties */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</div>
          <div className="mt-1.5 text-sm leading-relaxed text-slate-700">
            <div className="font-medium text-slate-900">{company.name || "Your Company"}</div>
            {company.address ? <div>{company.address}</div> : null}
            {company.city ? <div>{company.city}</div> : null}
            {company.phone ? <div>{company.phone}</div> : null}
            {company.email ? <div>{company.email}</div> : null}
            <div className="mt-1 text-slate-500">VAT: {company.vatNumber || "—"}</div>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bill to</div>
          <div className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {customer ? (
              <>
                <div className="font-medium text-slate-900">{customer.company || customer.name}</div>
                {customer.company && customer.name ? <div>{customer.name}</div> : null}
                {customer.address ? <div>{customer.address}</div> : null}
                {customer.phone ? <div>{customer.phone}</div> : null}
                {customer.email ? <div>{customer.email}</div> : null}
                <div className="mt-1 text-slate-500">VAT: {customer.vatNumber || "—"}</div>
              </>
            ) : (
              <div className="italic text-slate-400">No customer selected</div>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
        <div>
          <span className="text-slate-400">Issue date: </span>
          <span className="font-medium text-slate-700">{formatDate(issueDate)}</span>
        </div>
        <div>
          <span className="text-slate-400">Due date: </span>
          <span className="font-medium text-slate-700">{formatDate(dueDate)}</span>
        </div>
      </div>

      {/* Line items */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3 font-semibold">Description</th>
              <th className="py-2 px-3 text-right font-semibold">Qty</th>
              <th className="py-2 px-3 text-right font-semibold">Unit price</th>
              <th className="py-2 px-3 text-right font-semibold">VAT</th>
              <th className="py-2 pl-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm italic text-slate-400">
                  No line items yet
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-3 text-slate-700">{item.name || "—"}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    <span className="font-mono">{formatCurrency(item.unitPrice, currency)}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {Math.round((item.vatRate || 0) * 100)}%
                  </td>
                  <td className="py-2.5 pl-3 text-right font-medium text-slate-800">
                    <span className="font-mono">{formatCurrency(lineSubtotal(item), currency)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <Row label="Subtotal" value={formatCurrency(totals.subtotal, currency)} />
          {discountPercent > 0 ? (
            <Row
              label={`Discount (${discountPercent}%)`}
              value={`− ${formatCurrency(totals.discountAmount, currency)}`}
            />
          ) : null}
          <Row label="VAT" value={formatCurrency(totals.vatTotal, currency)} />
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(totals.total, currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes + disclaimer */}
      {notes ? (
        <div className="mt-8 border-t border-slate-100 pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</div>
          <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">{notes}</p>
        </div>
      ) : null}

      <p className="mt-8 text-center text-[11px] text-slate-400">
        Generated with {brand.name} · ZATCA-ready workflow foundation · Final compliance review required
        before production use.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-600">
      <span>{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
