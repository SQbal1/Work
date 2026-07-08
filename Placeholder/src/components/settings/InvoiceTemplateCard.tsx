"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import type { InvoiceHeaderMode } from "@/types";

const HEADER_MODES: { value: InvoiceHeaderMode; label: string }[] = [
  { value: "standard", label: "Standard — logo slot, company name and title" },
  { value: "letterhead", label: "My own letterhead — leave the header area blank" },
];

/** Clamp a mm input to the range the DB accepts (0–120). */
function clampMm(raw: string, fallback: number): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(120, Math.max(0, n));
}

export function InvoiceTemplateCard() {
  const { settings, updateSettings } = useStore();
  const toast = useToast();

  const [headerMode, setHeaderMode] = useState<InvoiceHeaderMode>(settings.invoiceHeaderMode);
  const [topMm, setTopMm] = useState(String(settings.invoiceLetterheadTopMm));
  const [bottomMm, setBottomMm] = useState(String(settings.invoiceLetterheadBottomMm));
  const [terms, setTerms] = useState(settings.invoiceTermsText);
  const [bankDetails, setBankDetails] = useState(settings.invoiceBankDetails);
  const [footerText, setFooterText] = useState(settings.invoiceFooterText);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateSettings({
      invoiceHeaderMode: headerMode,
      invoiceLetterheadTopMm: clampMm(topMm, 45),
      invoiceLetterheadBottomMm: clampMm(bottomMm, 25),
      invoiceTermsText: terms,
      invoiceBankDetails: bankDetails,
      invoiceFooterText: footerText,
    });
    toast.success("Invoice template saved");
  }

  return (
    <Card>
      <CardHeader
        title="Invoice template"
        subtitle="Control the printed document's header and footer — including printing onto your own letterhead."
      />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-5">
          <Select
            id="tpl-header-mode"
            label="Document header"
            value={headerMode}
            onChange={(e) => setHeaderMode(e.target.value as InvoiceHeaderMode)}
            options={HEADER_MODES.map((m) => ({ value: m.value, label: m.label }))}
          />
          {headerMode === "letterhead" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="tpl-top-mm"
                type="number"
                min="0"
                max="120"
                label="Reserved space at the top (mm)"
                hint="Blank band for your letterhead's printed header."
                value={topMm}
                onChange={(e) => setTopMm(e.target.value)}
              />
              <Input
                id="tpl-bottom-mm"
                type="number"
                min="0"
                max="120"
                label="Reserved space at the bottom (mm)"
                hint="Blank band for your letterhead's printed footer."
                value={bottomMm}
                onChange={(e) => setBottomMm(e.target.value)}
              />
            </div>
          ) : null}
          <Textarea
            id="tpl-terms"
            label="Terms & conditions"
            hint="Printed in its own block on every invoice (payment terms, late fees, ownership…)."
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
          />
          <Textarea
            id="tpl-bank"
            label="Bank account details"
            hint="Account name, IBAN, SWIFT/BIC — shown so customers know where to pay."
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
            rows={3}
          />
          <Textarea
            id="tpl-footer"
            label="Footer line"
            hint="A short line printed at the very bottom (e.g. “This is a computer-generated invoice”)."
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={2}
          />
        </CardBody>
        <div className="flex justify-end border-t border-hairline px-5 py-4 sm:px-6">
          <Button type="submit">
            <Save className="h-4 w-4" /> Save template
          </Button>
        </div>
      </form>
    </Card>
  );
}
