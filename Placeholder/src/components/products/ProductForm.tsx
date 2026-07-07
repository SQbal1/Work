"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { VAT_CATEGORIES } from "@/data/constants";
import { brand } from "@/config/brand";
import type { VatCategory } from "@/types";
import { cn } from "@/lib/cn";

export interface ProductFormValues {
  name: string;
  description: string;
  unitPrice: number;
  vatCategory: VatCategory;
  active: boolean;
}

export function ProductForm({
  formId,
  initial,
  onSubmit,
}: {
  formId: string;
  initial?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceText, setPriceText] = useState(
    initial?.unitPrice != null ? String(initial.unitPrice) : "",
  );
  const [vatCategory, setVatCategory] = useState<VatCategory>(initial?.vatCategory ?? "standard");
  const [active, setActive] = useState(initial?.active ?? true);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const price = parseFloat(priceText);
    const next: { name?: string; price?: string } = {};
    if (!name.trim()) next.name = "Name is required";
    if (priceText === "" || Number.isNaN(price) || price < 0) next.price = "Enter a valid price";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({ name: name.trim(), description: description.trim(), unitPrice: price, vatCategory, active });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="p-name"
        label="Name"
        required
        placeholder="e.g. Monthly advisory retainer"
        value={name}
        error={errors.name}
        onChange={(e) => setName(e.target.value)}
      />
      <Textarea
        id="p-desc"
        label="Description"
        placeholder="Short description shown on the invoice line"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="p-price"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          label={`Unit price (${brand.currency})`}
          placeholder="0.00"
          value={priceText}
          error={errors.price}
          onChange={(e) => setPriceText(e.target.value)}
        />
        <Select
          id="p-vat"
          label="VAT category"
          hint="Confirm the right treatment with your accountant"
          value={vatCategory}
          onChange={(e) => setVatCategory(e.target.value as VatCategory)}
          options={VAT_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-cloud">Status</span>
        <div className="inline-flex rounded-[10px] border border-hairline bg-ink p-1">
          {[
            { value: true, label: "Active" },
            { value: false, label: "Inactive" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setActive(opt.value)}
              className={cn(
                "rounded-[10px] px-4 py-1.5 text-sm font-medium transition",
                active === opt.value
                  ? "bg-signal text-ink"
                  : "text-fog hover:text-cloud",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-fog">
          Inactive items stay in your records but are hidden when building new invoices.
        </p>
      </div>
    </form>
  );
}
