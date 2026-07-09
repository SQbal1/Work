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
  /** Logo size as a percentage of the default (50–200). */
  logoScale?: number;
  /** Uploaded stamp/seal (data URL) + whether to show it. */
  stampDataUrl?: string;
  stampEnabled?: boolean;
  /** Content blocks printed near the foot of the invoice. */
  termsText?: string;
  bankDetails?: string;
  /** Full-width letterhead banners embedded at the very top/bottom when enabled. */
  letterheadImageEnabled?: boolean;
  headerImageDataUrl?: string;
  footerImageDataUrl?: string;
  /** ZATCA Phase-2 structural preview fields — present only once the invoice has been signed. */
  zatcaInvoiceHash?: string | null;
  zatcaSignature?: string | null;
  zatcaPublicKey?: string | null;
}

/**
 * Isolated Arabic run. `dir="rtl"` gives the span its own bidi context so
 * neighbouring digits/colons can't be reordered into it, and `tracking-normal`
 * cancels any inherited letter-spacing — letter-spacing breaks Arabic cursive
 * joining (the "لوص ف" garble Ali flagged in the table headers).
 */
function Ar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="rtl" className={cn("font-arabic tracking-normal", className)}>
      {children}
    </span>
  );
}

/** The default brand mark (Invoice X): dark tile carrying the gradient X. Used until a tenant uploads their own logo. */
function InvoiceLogoMark({ size }: { size: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0d0f12] ring-1 ring-slate-700"
      style={{ height: size, width: size }}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(80% 80% at 30% 20%, rgba(168,255,83,0.18), transparent 70%)" }}
      />
      <svg viewBox="0 0 24 24" className="relative" style={{ height: size * 0.44, width: size * 0.44 }} aria-hidden>
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

/** One row of the bordered meta table: EN label (left) · value (centre) · AR label (right). */
function MetaRow({ en, ar, value }: { en: string; ar: string; value: ReactNode }) {
  return (
    <tr>
      <th className="w-1/4 border border-slate-300 bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
        {en}
      </th>
      <td className="border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-900">
        {value}
      </td>
      <th className="w-1/4 border border-slate-300 bg-slate-50 px-3 py-2 text-right">
        <Ar className="text-xs font-medium text-slate-500">{ar}</Ar>
      </th>
    </tr>
  );
}

/** Stacked bilingual column header for the line-items table. */
function ColHead({ en, ar, align = "left" }: { en: string; ar: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div>{en}</div>
      <Ar className="font-normal text-white/60">{ar}</Ar>
    </div>
  );
}

/** A bordered party box (From / Bill to). */
function PartyBox({
  en,
  ar,
  children,
  vatLabelAr,
  vatNumber,
}: {
  en: string;
  ar: string;
  children: ReactNode;
  vatLabelAr: string;
  vatNumber: string;
}) {
  return (
    <div className="rounded-lg border border-slate-300">
      <div
        className="flex items-baseline justify-between gap-3 border-b border-slate-300 px-4 py-2 text-white"
        style={{ background: TABLE_GRADIENT }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">{en}</span>
        <Ar className="text-[11px] font-medium text-white/70">{ar}</Ar>
      </div>
      <div className="px-4 py-3">
        <div className="text-sm leading-relaxed text-slate-700">{children}</div>
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-200 pt-2 text-xs">
          <span className="text-slate-400">
            VAT <Ar>{vatLabelAr}</Ar>
          </span>
          <span className="font-mono font-medium text-slate-700">{vatNumber || "—"}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * The clean, printable invoice layout. Shared by the builder's live preview and
 * the standalone invoice preview page so they can never drift apart. Bilingual
 * (EN/AR, ZATCA-style tax invoice) laid out per Ali's reference: centred logo,
 * centred title, a bordered meta table with the invoice number on the left, then
 * From / Bill-to, a bordered green→blue items table, QR (left) + totals (right),
 * and bank details + stamp above a centred footer. Every Arabic run is bidi- and
 * letter-spacing-isolated so it always shapes and orders correctly. The QR is
 * Phase-1-style by default, upgrading to a simulated Phase-2 stamp once signed —
 * a preview, not a compliance claim.
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

  // Logo sizing — base 64px scaled by the tenant's percentage (clamped 50–200).
  const logoScale = Math.min(200, Math.max(50, props.logoScale ?? 100)) / 100;
  const logoSize = Math.round(64 * logoScale);

  // Embedded letterhead banners — full-bleed header/footer images.
  const letterheadOn = Boolean(props.letterheadImageEnabled);
  const headerImg = letterheadOn ? props.headerImageDataUrl ?? "" : "";
  const footerImg = letterheadOn ? props.footerImageDataUrl ?? "" : "";

  const logo = logoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- data URL from settings; must render into the html2canvas capture.
    <img
      src={logoDataUrl}
      alt={`${company.name || "Company"} logo`}
      className="w-auto object-contain"
      style={{ height: logoSize, maxWidth: Math.round(logoSize * 3.5) }}
    />
  ) : (
    <InvoiceLogoMark size={logoSize} />
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
    <div className="print-area mx-auto w-full max-w-3xl overflow-hidden bg-white text-slate-800">
      {/* Letterhead header banner (full-bleed) or the signal keyline. */}
      {headerImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL from settings; must render into the html2canvas capture.
        <img src={headerImg} alt="Letterhead header" className="block w-full object-contain" />
      ) : !isLetterhead ? (
        <div className="h-1 w-full" style={{ background: SIGNAL_GRADIENT }} />
      ) : null}

      <div className="p-6 sm:p-10">
        {isLetterhead ? (
          <div aria-hidden style={{ height: `${Math.max(0, props.letterheadTopMm ?? 45)}mm` }} />
        ) : null}

        {/* Header — logo on top (centred), title below it. The logo is hidden when a
            letterhead banner already carries the tenant's branding. */}
        <div className="flex flex-col items-center gap-3 text-center">
          {!isLetterhead && !headerImg ? logo : null}
          <div className="text-2xl font-bold leading-none tracking-tight text-slate-900 sm:text-3xl">
            <Ar className="align-middle">فاتورة ضريبية</Ar> <span className="align-middle">Tax Invoice</span>
          </div>
          {!isLetterhead && !headerImg && (company.name || company.legalName) ? (
            <div className="text-sm font-medium text-slate-500">{company.name || company.legalName}</div>
          ) : null}
        </div>

        {/* Meta table — bordered; invoice number on the left. */}
        <table className="mt-6 w-full border-collapse">
          <tbody>
            <MetaRow en="Invoice number" ar="رقم الفاتورة" value={<span className="font-mono">{number}</span>} />
            <MetaRow en="Issue date" ar="تاريخ الإصدار" value={formatDate(issueDate)} />
            <MetaRow en="Due date" ar="تاريخ الاستحقاق" value={formatDate(dueDate)} />
            <MetaRow en="Status" ar="الحالة" value={statusChip} />
          </tbody>
        </table>

        {/* From / Bill to */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PartyBox en="From" ar="من" vatLabelAr="الرقم الضريبي" vatNumber={company.vatNumber}>
            <div className="font-semibold text-slate-900">{company.name || "Your Company"}</div>
            {company.address ? <div>{company.address}</div> : null}
            {company.city ? <div>{company.city}</div> : null}
            {company.phone ? <div>{company.phone}</div> : null}
            {company.email ? <div>{company.email}</div> : null}
          </PartyBox>

          {customer ? (
            <PartyBox en="Bill to" ar="إلى" vatLabelAr="الرقم الضريبي" vatNumber={customer.vatNumber}>
              <div className="font-semibold text-slate-900">{customer.company || customer.name}</div>
              {customer.company && customer.name ? <div>{customer.name}</div> : null}
              {customer.address ? <div>{customer.address}</div> : null}
              {customer.phone ? <div>{customer.phone}</div> : null}
              {customer.email ? <div>{customer.email}</div> : null}
            </PartyBox>
          ) : (
            <div className="rounded-lg border border-slate-300">
              <div
                className="flex items-baseline justify-between gap-3 border-b border-slate-300 px-4 py-2 text-white"
                style={{ background: TABLE_GRADIENT }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Bill to</span>
                <Ar className="text-[11px] font-medium text-white/70">إلى</Ar>
              </div>
              <div className="px-4 py-3 text-sm italic text-slate-400">No customer selected</div>
            </div>
          )}
        </div>

        {/* Line items — bordered table, green→blue header. */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white" style={{ background: TABLE_GRADIENT }}>
                <th className="border border-slate-300 px-3 py-2.5 font-semibold">
                  <ColHead en="Description" ar="الوصف" />
                </th>
                <th className="border border-slate-300 px-3 py-2.5 font-semibold">
                  <ColHead en="Qty" ar="الكمية" align="right" />
                </th>
                <th className="border border-slate-300 px-3 py-2.5 font-semibold">
                  <ColHead en="Unit price" ar="سعر الوحدة" align="right" />
                </th>
                <th className="border border-slate-300 px-3 py-2.5 font-semibold">
                  <ColHead en="VAT" ar="الضريبة" align="right" />
                </th>
                <th className="border border-slate-300 px-3 py-2.5 font-semibold">
                  <ColHead en="Amount" ar="المبلغ" align="right" />
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-slate-300 py-6 text-center text-sm italic text-slate-400">
                    No line items yet
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 1 ? "bg-emerald-50/40" : "bg-white"}>
                    <td className="border border-slate-300 px-3 py-3 font-medium text-slate-800">
                      {item.name || "—"}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-right text-slate-600 nums-tabular">
                      {item.quantity}
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-right text-slate-600">
                      <span className="font-mono nums-tabular">
                        <Money amount={item.unitPrice} currency={currency} />
                      </span>
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-right text-slate-500 nums-tabular">
                      {Math.round((item.vatRate || 0) * 100)}%
                    </td>
                    <td className="border border-slate-300 px-3 py-3 text-right font-semibold text-slate-900">
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

        {/* QR (left) + totals (right) — the NEX-style bottom Ali asked for. */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-col items-start gap-2">
            <ZatcaQr
              sellerName={company.name || company.legalName || "Your Company"}
              vatNumber={company.vatNumber}
              timestamp={`${issueDate}T00:00:00Z`}
              total={totals.total}
              vatTotal={totals.vatTotal}
              invoiceHash={props.zatcaInvoiceHash ?? undefined}
              signature={props.zatcaSignature ?? undefined}
              publicKey={props.zatcaPublicKey ?? undefined}
              size={104}
            />
            <div className="max-w-[12rem] text-[11px] leading-snug text-slate-400">
              <div className="font-semibold text-slate-500">
                Scan to verify · <Ar className="text-slate-500">امسح للتحقق</Ar>
              </div>
              <div className="mt-0.5">
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

          <div className="w-full max-w-xs sm:w-auto sm:min-w-[16rem]">
            <div className="overflow-hidden rounded-lg border border-slate-300">
              <div className="space-y-2 px-4 py-3 text-sm">
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
                className="flex items-center justify-between gap-4 px-4 py-3 text-base font-semibold text-white"
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
        </div>

        {/* Notes */}
        {notes ? (
          <div className="mt-6 rounded-lg border border-slate-300 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Notes <Ar className="font-medium normal-case tracking-normal text-slate-400">ملاحظات</Ar>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{notes}</p>
          </div>
        ) : null}

        {/* Terms & conditions — full width, small print. */}
        {termsText ? (
          <div className="mt-4 rounded-lg border border-slate-300 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Terms &amp; conditions{" "}
              <Ar className="font-medium normal-case tracking-normal text-slate-400">الشروط والأحكام</Ar>
            </div>
            <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">{termsText}</p>
          </div>
        ) : null}

        {/* Bank details (left) + stamp (right), per the NEX sample. */}
        {bankDetails || showStamp ? (
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            {bankDetails ? (
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Bank details{" "}
                  <Ar className="font-medium normal-case tracking-normal text-slate-400">التفاصيل البنكية</Ar>
                </div>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">{bankDetails}</p>
              </div>
            ) : (
              <div className="flex-1" />
            )}
            {showStamp ? (
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
            ) : null}
          </div>
        ) : null}

        {/* Centred footer. */}
        <div className="mt-8 border-t border-slate-200 pt-3 text-center">
          {props.footerText ? (
            <p className="whitespace-pre-line text-xs leading-relaxed text-slate-500">{props.footerText}</p>
          ) : null}
          <p className={cn("text-xs font-medium text-slate-500", props.footerText ? "mt-1" : "")}>
            {company.name || brand.name}
            {company.legalName ? (
              <>
                {" · "}
                <Ar className="text-slate-400">{company.legalName}</Ar>
              </>
            ) : null}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            <span className="font-mono">{number}</span> · Page 1 of 1 · Generated with {brand.name} ·
            ZATCA-ready workflow foundation
          </p>
        </div>

        {isLetterhead ? (
          <div aria-hidden style={{ height: `${Math.max(0, props.letterheadBottomMm ?? 25)}mm` }} />
        ) : null}
      </div>

      {/* Letterhead footer banner (full-bleed). */}
      {footerImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL from settings; must render into the html2canvas capture.
        <img src={footerImg} alt="Letterhead footer" className="block w-full object-contain" />
      ) : null}
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

function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-slate-600">
      <span>{label}</span>
      <span className="font-mono font-medium text-slate-800 nums-tabular">{value}</span>
    </div>
  );
}
