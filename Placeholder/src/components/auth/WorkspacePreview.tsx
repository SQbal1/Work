"use client";

import { BadgeCheck, Languages, ShieldCheck } from "lucide-react";
import { brand } from "@/config/brand";

/**
 * Signup's live "your workspace" preview. As the visitor types their name and
 * company, this reflects them straight back — a personalized greeting and a
 * miniature of the very first invoice they'll send — so the form reads as
 * "watch your workspace come to life" rather than a data-entry chore. Pure
 * client-side; updates on every keystroke.
 */
export function WorkspacePreview({ name, company }: { name: string; company: string }) {
  const firstName = name.trim().split(/\s+/)[0] || "";
  const initial = (firstName || company.trim() || "X").charAt(0).toUpperCase();
  const displayCompany = company.trim() || "Your company";

  return (
    <div className="glass-strong flex h-full flex-col gap-5 rounded-2xl p-7 sm:p-8">
      {/* Personalized greeting */}
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-signal/30 bg-signal/10 font-display text-lg font-semibold text-signal">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-bone">
            {firstName ? `Nice to meet you, ${firstName}` : "Let's set you up"}
          </p>
          <p className="text-xs text-fog">
            {company.trim() ? `${displayCompany} is almost ready to invoice.` : "Your first invoice is seconds away."}
          </p>
        </div>
      </div>

      {/* Mini invoice — the seller reflects their company name live */}
      <div className="rounded-xl bg-white p-4 text-slate-800 shadow-lift">
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{displayCompany}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Seller · البائع</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold leading-tight text-slate-900">TAX INVOICE</div>
            <div className="font-arabic text-[10px] text-slate-500" dir="rtl">
              فاتورة ضريبية
            </div>
          </div>
        </div>
        <div className="space-y-1.5 py-3 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Consulting services</span>
            <span className="font-mono">1,000.00</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>VAT (15%)</span>
            <span className="font-mono">150.00</span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
          <span>Total · SAR</span>
          <span className="font-mono">1,150.00</span>
        </div>
      </div>

      {/* Reassurance — value, not friction */}
      <ul className="mt-auto grid gap-2 text-xs text-fog">
        {[
          { icon: Languages, label: "Bilingual invoices in English and Arabic, out of the box" },
          { icon: BadgeCheck, label: `VAT auto-calculated at the ${Math.round(brand.vatRate * 100)}% ${brand.country} rate` },
          { icon: ShieldCheck, label: "ZATCA-ready workflow foundation" },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-signal" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
