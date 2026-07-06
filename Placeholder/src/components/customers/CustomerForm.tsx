"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export interface CustomerFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  vatNumber: string;
  address: string;
  notes: string;
}

const empty: CustomerFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  vatNumber: "",
  address: "",
  notes: "",
};

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** KSA VAT numbers are 15 digits. Only checked when a value is actually entered. */
function isValidVat(v: string): boolean {
  return /^\d{15}$/.test(v.replace(/\s/g, ""));
}

/**
 * Controlled customer form. Renders only the fields — the surrounding Modal
 * supplies the submit/cancel buttons via the shared `formId`.
 */
export function CustomerForm({
  formId,
  initial,
  onSubmit,
}: {
  formId: string;
  initial?: Partial<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const [values, setValues] = useState<CustomerFormValues>({ ...empty, ...initial });
  const [errors, setErrors] = useState<{ name?: string; email?: string; vatNumber?: string }>({});

  function set<K extends keyof CustomerFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: { name?: string; email?: string; vatNumber?: string } = {};
    if (!values.name.trim()) next.name = "Name is required";
    if (values.email.trim() && !emailPattern.test(values.email.trim()))
      next.email = "Enter a valid email";
    if (values.vatNumber.trim() && !isValidVat(values.vatNumber))
      next.vatNumber = "VAT number should be 15 digits";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Trim every text field so stored data stays clean and consistent.
    const trimmed = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v.trim()]),
    ) as CustomerFormValues;
    onSubmit(trimmed);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="c-name"
          label="Name"
          required
          placeholder="Contact person"
          value={values.name}
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <Input
          id="c-company"
          label="Company"
          placeholder="Company / organisation"
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
        />
        <Input
          id="c-email"
          type="email"
          label="Email"
          placeholder="name@company.sa"
          value={values.email}
          error={errors.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <Input
          id="c-phone"
          label="Phone"
          placeholder="+966 5x xxx xxxx"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <Input
          id="c-vat"
          label="VAT number"
          hint="15 digits in KSA (optional)"
          placeholder="3xxxxxxxxxxxxx3"
          value={values.vatNumber}
          error={errors.vatNumber}
          onChange={(e) => set("vatNumber", e.target.value)}
        />
        <Input
          id="c-address"
          label="Address"
          placeholder="Street, district, city"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>
      <Textarea
        id="c-notes"
        label="Notes"
        placeholder="Payment terms, preferences, anything useful…"
        value={values.notes}
        onChange={(e) => set("notes", e.target.value)}
      />
    </form>
  );
}
