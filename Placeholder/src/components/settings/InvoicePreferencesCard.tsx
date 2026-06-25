"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { DUE_DATE_PRESETS } from "@/data/constants";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";

const CURRENCIES = ["SAR", "AED", "BHD", "KWD", "OMR", "QAR"];

export function InvoicePreferencesCard() {
  const { settings, updateSettings } = useStore();
  const toast = useToast();

  const [prefix, setPrefix] = useState(settings.invoicePrefix);
  const [nextNumber, setNextNumber] = useState(String(settings.nextInvoiceNumber));
  const [currency, setCurrency] = useState(settings.currency);
  const [vatPercent, setVatPercent] = useState(String(Math.round(settings.defaultVatRate * 100)));
  const [dueDays, setDueDays] = useState(String(settings.defaultDueDays));
  const [notes, setNotes] = useState(settings.defaultNotes);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateSettings({
      invoicePrefix: prefix,
      nextInvoiceNumber: Math.max(1, parseInt(nextNumber, 10) || 1),
      currency,
      defaultVatRate: (Number(vatPercent) || 0) / 100,
      defaultDueDays: parseInt(dueDays, 10) || 0,
      defaultNotes: notes,
    });
    toast.success("Invoice preferences saved");
  }

  return (
    <Card>
      <CardHeader
        title="Invoice preferences"
        subtitle="Defaults applied to new invoices."
      />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="pref-prefix"
              label="Invoice number prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="INV-"
            />
            <Input
              id="pref-next"
              type="number"
              min="1"
              label="Next invoice number"
              value={nextNumber}
              onChange={(e) => setNextNumber(e.target.value)}
            />
            <Select
              id="pref-currency"
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
            <Input
              id="pref-vat"
              type="number"
              min="0"
              max="100"
              step="1"
              label="Default VAT rate (%)"
              hint="KSA standard rate is 15%"
              value={vatPercent}
              onChange={(e) => setVatPercent(e.target.value)}
            />
            <Select
              id="pref-due"
              label="Default payment terms"
              value={dueDays}
              onChange={(e) => setDueDays(e.target.value)}
              options={DUE_DATE_PRESETS.map((p) => ({ value: String(p.days), label: p.label }))}
            />
          </div>
          <Textarea
            id="pref-notes"
            label="Default invoice notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </CardBody>
        <div className="flex justify-end border-t border-hairline px-5 py-4 sm:px-6">
          <Button type="submit">
            <Save className="h-4 w-4" /> Save preferences
          </Button>
        </div>
      </form>
    </Card>
  );
}
