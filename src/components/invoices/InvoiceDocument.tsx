import type { ReactNode } from "react";
import type { Company, Customer, InvoiceLineItem, InvoiceStatus } from "@/types";
import { computeTotals, lineSubtotal } from "@/lib/calc";
import { formatDate } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Money } from "@/components/ui/Money";
import { ZatcaQr } from "./ZatcaQr";

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
  /** ZATCA Phase-2 structural preview fields — present only once the invoice has been signed. */
  zatcaInvoiceHash?: string | null;
  zatcaSignature?: string | null;
  zatcaPublicKey?: string | null;
}

/** A small English + Arabic label pair, stacked. */
function BiLabel({ en, ar, className }: { en: string; ar: string; className?: string }) {
  return (
    <div className={cn("text-xs font-semibold uppercase tracking-wider text-slate-400", className)}>
      {en} <span className="font-normal normal-case tracking-normal text-slate-400" dir="rtl">· {ar}</span>
    </div>
  );
}

/**
 * The clean, printable invoice layout. Shared by the builder's live preview and
 * the standalone invoice preview page so they can never drift apart. Bilingual
 * (EN/AR) with a ZATCA QR (Phase-1-style, upgrading to a simulated Phase-2-style
 * stamp once signed) — a compliance *preview*, not a claim.
 */
export function InvoiceDocument(props: InvoiceDocumentProps) {
  const { company, customer, number, issueDate, dueDate, status, items, discountPercent, notes } = props;
  const currency = props.currency ?? brand.currency;
  const totals = computeTotals(items, discountPercent);
  const statusMeta = STATUS_META[status];
  const isZatcaSigned = Boolean(props.zatcaInvoiceHash);

  return (
    <div className="print-area mx-auto w-full max-w-3xl bg-white p-6 text-slate-800 sm:p-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
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
          <div className="text-2xl font-bold leading-none tracking-tight text-slate-900">TAX INVOICE</div>
          <div className="mt-1 text-base font-semibold text-slate-500" dir="rtl">
            فاتورة ضريبية
          </div>
          <div className="mt-2 font-mono text-sm text-slate-500">{number}</div>
          <span
            className={cn(
              "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
              status === "paid"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : status === "sent"
                  ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
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
          <BiLabel en="From" ar="من" />
          <div className="mt-1.5 text-sm leading-relaxed text-slate-700">
            <div className="font-medium text-slate-900">{company.name || "Your Company"}</div>
            {company.address ? <div>{company.address}</div> : null}
            {company.city ? <div>{company.city}</div> : null}
            {company.phone ? <div>{company.phone}</div> : null}
            {company.email ? <div>{company.email}</div> : null}
            <div className="mt-1 text-slate-500">VAT · الرقم الضريبي: {company.vatNumber || "—"}</div>
          </div>
        </div>
        <div>
          <BiLabel en="Bill to" ar="إلى" />
          <div className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {customer ? (
              <>
                <div className="font-medium text-slate-900">{customer.company || customer.name}</div>
                {customer.company && customer.name ? <div>{customer.name}</div> : null}
                {customer.address ? <div>{customer.address}</div> : null}
                {customer.phone ? <div>{customer.phone}</div> : null}
                {customer.email ? <div>{customer.email}</div> : null}
                <div className="mt-1 text-slate-500">VAT · الرقم الضريبي: {customer.vatNumber || "—"}</div>
              </>
            ) : (
              <div className="italic text-slate-400">No customer selected</div>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2 rounded-lg bg-slate-50 px-4 py-3 text-sm ring-1 ring-slate-100">
        <div>
          <span className="text-slate-400">Issue date · تاريخ الإصدار: </span>
          <span className="font-medium text-slate-700">{formatDate(issueDate)}</span>
        </div>
        <div>
          <span className="text-slate-400">Due date · تاريخ الاستحقاق: </span>
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
                    <span className="font-mono">
                      <Money amount={item.unitPrice} currency={currency} />
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {Math.round((item.vatRate || 0) * 100)}%
                  </td>
                  <td className="py-2.5 pl-3 text-right font-medium text-slate-800">
                    <span className="font-mono">
                      <Money amount={lineSubtotal(item)} currency={currency} />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* QR + Totals */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <ZatcaQr
            sellerName={company.name || company.legalName || "Your Company"}
            vatNumber={company.vatNumber}
            timestamp={`${issueDate}T00:00:00Z`}
            total={totals.total}
            vatTotal={totals.vatTotal}
            invoiceHash={props.zatcaInvoiceHash ?? undefined}
            signature={props.zatcaSignature ?? undefined}
            publicKey={props.zatcaPublicKey ?? undefined}
            size={92}
          />
          <div className="max-w-[10rem] text-[11px] leading-snug text-slate-400">
            <div className="font-semibold text-slate-500">Scan to verify</div>
            <div dir="rtl" className="text-slate-500">امسح للتحقق</div>
            <div className="mt-1">
              {isZatcaSigned ? "ZATCA Phase-2 QR (simulated stamp, not ZATCA-certified)" : "ZATCA Phase-1 QR (preview)"}
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-2 text-sm sm:w-auto">
          <Row label="Subtotal · المجموع الفرعي" value={<Money amount={totals.subtotal} currency={currency} />} />
          {discountPercent > 0 ? (
            <Row
              label={`Discount (${discountPercent}%) · الخصم`}
              value={
                <span className="inline-flex items-baseline gap-1">
                  <span>−</span>
                  <Money amount={totals.discountAmount} currency={currency} />
                </span>
              }
            />
          ) : null}
          <Row label="VAT (15%) · ضريبة القيمة المضافة" value={<Money amount={totals.vatTotal} currency={currency} />} />
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
            <span>Total · الإجمالي</span>
            <span className="font-mono">
              <Money amount={totals.total} currency={currency} />
            </span>
          </div>
        </div>
      </div>

      {/* Notes + disclaimer */}
      {notes ? (
        <div className="mt-8 border-t border-slate-100 pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notes · ملاحظات</div>
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

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-slate-600">
      <span>{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
