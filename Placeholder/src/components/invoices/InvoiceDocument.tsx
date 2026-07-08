import type { ReactNode } from "react";
import type { Company, Customer, InvoiceHeaderMode, InvoiceLineItem, InvoiceStatus } from "@/types";
import { computeTotals, lineSubtotal } from "@/lib/calc";
import { formatDate } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { Money } from "@/components/ui/Money";
import { ZatcaQr } from "./ZatcaQr";

/** The Invoice X signal gradient, inlined so print/PDF capture never depends on CSS vars. */
const SIGNAL_GRADIENT = "linear-gradient(100deg, #d9f07c 0%, #a8ff53 42%, #3ee6a0 100%)";
/** Table header / total bar — green→blue, per Ali's requested colour scheme. */
const TABLE_GRADIENT = "linear-gradient(90deg, #064e3b 0%, #0e3a52 55%, #0f2f4a 100%)";

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
  /** "letterhead" reserves blank bands top/bottom for pre-printed stationery. */
  headerMode?: InvoiceHeaderMode;
  letterheadTopMm?: number;
  letterheadBottomMm?: number;
  /** Custom footer small-print line. */
  footerText?: string;
  /** Uploaded company logo (data URL); empty → the Invoice X default mark. */
  logoDataUrl?: string;
  /** Uploaded stamp/seal (data URL) + whether to show it. */
  stampDataUrl?: string;
  stampEnabled?: boolean;
  /** Content blocks printed near the foot of the invoice. */
  termsText?: string;
  bankDetails?: string;
  /** ZATCA Phase-2 structural preview fields — present only once the invoice has been signed. */
  zatcaInvoiceHash?: string | null;
  zatcaSignature?: string | null;
  zatcaPublicKey?: string | null;
}

/**
 * Isolated Arabic run. `dir="rtl"` gives the span its own bidi context, so
 * neighbouring digits, colons, and middots can never be reordered into the
 * Arabic text (the bug that used to render "Issue date · 08 :تاريخ الإصدار").
 */
function Ar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="rtl" className={cn("font-arabic", className)}>
      {children}
    </span>
  );
}

/** Boxed-section header: English label on the left, Arabic on the right. */
function BoxHeading({ en, ar }: { en: string; ar: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 pb-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{en}</span>
      <Ar className="text-[11px] font-medium text-slate-400">{ar}</Ar>
    </div>
  );
}

/** Stacked bilingual label for table headers. */
function StackLabel({ en, ar, align = "left" }: { en: string; ar: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div>{en}</div>
      <Ar className="font-normal text-white/60">{ar}</Ar>
    </div>
  );
}

/** Inline bilingual label for totals rows — the amount lives in a separate flex item, so bidi stays safe. */
function InlineLabel({ en, ar, className }: { en: string; ar: string; className?: string }) {
  return (
    <span className={className}>
      {en} <Ar className="font-normal text-slate-400">{ar}</Ar>
    </span>
  );
}

/** The default brand mark (Invoice X): dark tile carrying the gradient X. Used until a tenant uploads their own logo. */
function InvoiceLogoMark() {
  return (
    <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0d0f12] ring-1 ring-slate-700">
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(80% 80% at 30% 20%, rgba(168,255,83,0.18), transparent 70%)" }}
      />
      <svg viewBox="0 0 24 24" className="relative h-6 w-6" aria-hidden>
        <defs>
          <linearGradient id="ix-doc-x" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d9f07c" />
            <stop offset="45%" stopColor="#a8ff53" />
            <stop offset="100%" stopColor="#3ee6a0" />
          </linearGradient>
        </defs>
        <path
          d="M4 3.5 L10.4 12 L4 20.5 H8.1 L12.4 14.7 L16.7 20.5 H20.8 L14.4 12 L20.8 3.5 H16.7 L12.4 9.3 L8.1 3.5 Z"
          fill="url(#ix-doc-x)"
        />
      </svg>
    </span>
  );
}

/**
 * The clean, printable invoice layout. Shared by the builder's live preview and
 * the standalone invoice preview page so they can never drift apart. Bilingual
 * (EN/AR, ZATCA-style tax invoice); every Arabic run is bidi-isolated and values
 * always sit in their own layout cell so numbers never garble. Logo, stamp, terms,
 * and bank details are workspace settings that flow onto every invoice. In
 * letterhead mode the app header is replaced by reserved blank bands so tenants
 * can print onto their own stationery. The QR is Phase-1-style by default,
 * upgrading to a simulated Phase-2-style stamp once signed — a preview, not a claim.
 */
export function InvoiceDocument(props: InvoiceDocumentProps) {
  const { company, customer, number, issueDate, dueDate, status, items, discountPercent, notes } = props;
  const currency = props.currency ?? brand.currency;
  const headerMode = props.headerMode ?? "standard";
  const isLetterhead = headerMode === "letterhead";
  const totals = computeTotals(items, discountPercent);
  const statusMeta = STATUS_META[status];
  const isZatcaSigned = Boolean(props.zatcaInvoiceHash);
  const logoDataUrl = props.logoDataUrl ?? "";
  const showStamp = Boolean(props.stampEnabled && props.stampDataUrl);
  const termsText = props.termsText ?? "";
  const bankDetails = props.bankDetails ?? "";

  const logo = logoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- data URL from settings; next/image can't optimize it and it must render into the html2canvas capture.
    <img src={logoDataUrl} alt={`${company.name || "Company"} logo`} className="h-14 w-auto max-w-[180px] object-contain" />
  ) : (
    <InvoiceLogoMark />
  );

  const statusChip = (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        status === "paid"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : status === "sent"
            ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
            : "bg-slate-100 text-slate-600 ring-slate-200",
      )}
    >
      {statusMeta.label}
    </span>
  );

  return (
    <div className="print-area mx-auto w-full max-w-3xl bg-white text-slate-800">
      {/* Signal keyline — the one surgical accent; skipped on letterhead paper. */}
      {!isLetterhead ? <div className="h-1 w-full" style={{ background: SIGNAL_GRADIENT }} /> : null}

      <div className="p-6 sm:p-10">
        {isLetterhead ? (
          <>
            {/* Reserved band for the tenant's pre-printed letterhead. */}
            <div aria-hidden style={{ height: `${Math.max(0, props.letterheadTopMm ?? 45)}mm` }} />
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4">
              <div>
                <div className="text-2xl font-bold leading-none tracking-tight text-slate-900">
                  TAX INVOICE
                </div>
                <Ar className="mt-1 block text-base font-semibold text-slate-600">فاتورة ضريبية</Ar>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-slate-500">{number}</div>
                <div className="mt-2">{statusChip}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-6">
            <div className="flex items-center gap-3.5">
              {logo}
              <div>
                <div className="text-lg font-semibold leading-tight text-slate-900">
                  {company.name || "Your Company"}
                </div>
                <div className="text-sm text-slate-500">
                  {company.legalName || company.city || brand.country}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold leading-none tracking-tight text-slate-900">
                TAX INVOICE
              </div>
              <Ar className="mt-1 block text-base font-semibold text-slate-600">فاتورة ضريبية</Ar>
              <div className="mt-2 font-mono text-sm text-slate-500">{number}</div>
              <div className="mt-2">{statusChip}</div>
            </div>
          </div>
        )}

        {/* Parties — boxed, per Ali's feedback. */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-200 sm:p-5">
            <BoxHeading en="From" ar="من" />
            <div className="mt-3 text-sm leading-relaxed text-slate-700">
              <div className="font-semibold text-slate-900">{company.name || "Your Company"}</div>
              {company.address ? <div>{company.address}</div> : null}
              {company.city ? <div>{company.city}</div> : null}
              {company.phone ? <div>{company.phone}</div> : null}
              {company.email ? <div>{company.email}</div> : null}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5 text-xs">
              <span className="text-slate-400">
                VAT <Ar>الرقم الضريبي</Ar>
              </span>
              <span className="font-mono font-medium text-slate-700">{company.vatNumber || "—"}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-200 sm:p-5">
            <BoxHeading en="Bill to" ar="إلى" />
            {customer ? (
              <>
                <div className="mt-3 text-sm leading-relaxed text-slate-700">
                  <div className="font-semibold text-slate-900">{customer.company || customer.name}</div>
                  {customer.company && customer.name ? <div>{customer.name}</div> : null}
                  {customer.address ? <div>{customer.address}</div> : null}
                  {customer.phone ? <div>{customer.phone}</div> : null}
                  {customer.email ? <div>{customer.email}</div> : null}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5 text-xs">
                  <span className="text-slate-400">
                    VAT <Ar>الرقم الضريبي</Ar>
                  </span>
                  <span className="font-mono font-medium text-slate-700">{customer.vatNumber || "—"}</span>
                </div>
              </>
            ) : (
              <div className="mt-3 text-sm italic text-slate-400">No customer selected</div>
            )}
          </div>
        </div>

        {/* Dates — bilingual label on the left, the date itself on the right (bidi-safe). */}
        <div className="mt-4 grid gap-px overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 bg-slate-50/70 px-4 py-3 sm:px-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <div>Issue date</div>
              <Ar className="font-medium normal-case tracking-normal text-slate-400">تاريخ الإصدار</Ar>
            </div>
            <div className="text-sm font-semibold text-slate-900">{formatDate(issueDate)}</div>
          </div>
          <div className="flex items-center justify-between gap-4 bg-slate-50/70 px-4 py-3 sm:px-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <div>Due date</div>
              <Ar className="font-medium normal-case tracking-normal text-slate-400">تاريخ الاستحقاق</Ar>
            </div>
            <div className="text-sm font-semibold text-slate-900">{formatDate(dueDate)}</div>
          </div>
        </div>

        {/* Line items — a proper bordered table with the green→blue header (Ali's ask). */}
        <div className="mt-7 overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-xl text-sm ring-1 ring-slate-300">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white" style={{ background: TABLE_GRADIENT }}>
                <th className="border-r border-white/10 px-3 py-2.5 font-semibold">
                  <StackLabel en="Description" ar="الوصف" />
                </th>
                <th className="border-r border-white/10 px-3 py-2.5 font-semibold">
                  <StackLabel en="Qty" ar="الكمية" align="right" />
                </th>
                <th className="border-r border-white/10 px-3 py-2.5 font-semibold">
                  <StackLabel en="Unit price" ar="سعر الوحدة" align="right" />
                </th>
                <th className="border-r border-white/10 px-3 py-2.5 font-semibold">
                  <StackLabel en="VAT" ar="الضريبة" align="right" />
                </th>
                <th className="px-3 py-2.5 font-semibold">
                  <StackLabel en="Amount" ar="المبلغ" align="right" />
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-slate-200 py-6 text-center text-sm italic text-slate-400">
                    No line items yet
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 1 ? "bg-emerald-50/40" : "bg-white"}>
                    <td className="border border-slate-200 px-3 py-3 font-medium text-slate-800">
                      {item.name || "—"}
                    </td>
                    <td className="border border-slate-200 px-3 py-3 text-right text-slate-600 nums-tabular">
                      {item.quantity}
                    </td>
                    <td className="border border-slate-200 px-3 py-3 text-right text-slate-600">
                      <span className="font-mono nums-tabular">
                        <Money amount={item.unitPrice} currency={currency} />
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-3 text-right text-slate-500 nums-tabular">
                      {Math.round((item.vatRate || 0) * 100)}%
                    </td>
                    <td className="border border-slate-200 px-3 py-3 text-right font-semibold text-slate-900">
                      <span className="font-mono nums-tabular">
                        <Money amount={lineSubtotal(item)} currency={currency} />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals + QR — totals left, ZATCA QR on the RIGHT (standard KSA layout) */}
        <div className="mt-7 flex flex-wrap-reverse items-start justify-between gap-6">
          <div className="w-full max-w-sm sm:w-auto sm:flex-1">
            <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
              <div className="space-y-2 px-4 py-3 text-sm sm:px-5">
                <Row
                  label={<InlineLabel en="Subtotal" ar="المجموع الفرعي" />}
                  value={<Money amount={totals.subtotal} currency={currency} />}
                />
                {discountPercent > 0 ? (
                  <Row
                    label={<InlineLabel en={`Discount (${discountPercent}%)`} ar="الخصم" />}
                    value={
                      <span className="inline-flex items-baseline gap-1">
                        <span>−</span>
                        <Money amount={totals.discountAmount} currency={currency} />
                      </span>
                    }
                  />
                ) : null}
                <Row
                  label={<InlineLabel en="VAT" ar="ضريبة القيمة المضافة" />}
                  value={<Money amount={totals.vatTotal} currency={currency} />}
                />
              </div>
              <div
                className="flex items-center justify-between gap-4 px-4 py-3 text-base font-semibold text-white sm:px-5"
                style={{ background: TABLE_GRADIENT }}
              >
                <span>
                  Total due <Ar className="font-medium text-white/70">الإجمالي المستحق</Ar>
                </span>
                <span className="font-mono nums-tabular">
                  <Money amount={totals.total} currency={currency} />
                </span>
              </div>
            </div>
          </div>

          {/* QR block — right-aligned per ZATCA-style layouts */}
          <div className="flex flex-row-reverse items-start gap-3 sm:shrink-0">
            <ZatcaQr
              sellerName={company.name || company.legalName || "Your Company"}
              vatNumber={company.vatNumber}
              timestamp={`${issueDate}T00:00:00Z`}
              total={totals.total}
              vatTotal={totals.vatTotal}
              invoiceHash={props.zatcaInvoiceHash ?? undefined}
              signature={props.zatcaSignature ?? undefined}
              publicKey={props.zatcaPublicKey ?? undefined}
              size={100}
            />
            <div className="max-w-[10rem] text-right text-[11px] leading-snug text-slate-400">
              <div className="font-semibold text-slate-500">Scan to verify</div>
              <Ar className="block text-slate-500">امسح للتحقق</Ar>
              <div className="mt-1">
                {isZatcaSigned
                  ? "ZATCA Phase-2 QR (simulated stamp, not ZATCA-certified)"
                  : "ZATCA Phase-1 QR (preview)"}
              </div>
              {isZatcaSigned ? (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Digitally signed
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes ? (
          <div className="mt-7 rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-200 sm:p-5">
            <BoxHeading en="Notes" ar="ملاحظات" />
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{notes}</p>
          </div>
        ) : null}

        {/* Terms & bank details — side by side; each shown only when filled in. */}
        {termsText || bankDetails ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {termsText ? (
              <div className="rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-200 sm:p-5">
                <BoxHeading en="Terms & conditions" ar="الشروط والأحكام" />
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-slate-600">{termsText}</p>
              </div>
            ) : null}
            {bankDetails ? (
              <div className="rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-200 sm:p-5">
                <BoxHeading en="Bank details" ar="التفاصيل البنكية" />
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-slate-600">{bankDetails}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Stamp / authorised-signature zone — appears automatically once a stamp is set. */}
        {showStamp ? (
          <div className="mt-7 flex justify-end">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL from settings; must render into the html2canvas capture. */}
              <img
                src={props.stampDataUrl}
                alt="Company stamp"
                className="mx-auto h-28 w-auto max-w-[180px] object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
              <div className="mt-1 border-t border-slate-300 pt-1 text-[11px] font-medium text-slate-500">
                Authorised signature <Ar className="text-slate-400">التوقيع المعتمد</Ar>
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer — tenant text first, then the (honest) provenance line. */}
        {props.footerText ? (
          <p className="mt-8 whitespace-pre-line text-center text-xs leading-relaxed text-slate-500">
            {props.footerText}
          </p>
        ) : null}
        <p className={cn("text-center text-[10px] text-slate-400", props.footerText ? "mt-3" : "mt-8")}>
          Generated with {brand.name} · ZATCA-ready workflow foundation · Final compliance review
          required before production use.
        </p>

        {isLetterhead ? (
          /* Reserved band for the letterhead's pre-printed footer. */
          <div aria-hidden style={{ height: `${Math.max(0, props.letterheadBottomMm ?? 25)}mm` }} />
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-slate-600">
      <span>{label}</span>
      <span className="font-mono font-medium text-slate-800 nums-tabular">{value}</span>
    </div>
  );
}
