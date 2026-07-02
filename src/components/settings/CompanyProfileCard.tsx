"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BusinessTypePicker } from "./BusinessTypePicker";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import type { BusinessTypeId, Company } from "@/types";

/** Small uppercase divider used to group related fields within the card. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wider text-fog">{children}</div>
  );
}

export function CompanyProfileCard() {
  const { company, updateCompany } = useStore();
  const toast = useToast();
  const [form, setForm] = useState<Company>(company);
  const [errors, setErrors] = useState<{ vatNumber?: string; crNumber?: string }>({});

  function set<K extends keyof Company>(key: K, value: Company[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: { vatNumber?: string; crNumber?: string } = {};
    if (form.vatNumber.trim() && !/^\d{15}$/.test(form.vatNumber.replace(/\s/g, "")))
      next.vatNumber = "VAT number should be 15 digits";
    if (form.crNumber.trim() && !/^\d{10}$/.test(form.crNumber.replace(/\s/g, "")))
      next.crNumber = "CR number should be 10 digits";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Trim all text fields so the seller block on invoices stays clean.
    const trimmed = { ...form } as Company;
    (Object.keys(trimmed) as (keyof Company)[]).forEach((k) => {
      if (typeof trimmed[k] === "string") (trimmed[k] as string) = (trimmed[k] as string).trim();
    });
    updateCompany(trimmed);
    setForm(trimmed);
    toast.success("Company profile saved");
  }

  return (
    <Card>
      <CardHeader
        title="Company profile"
        subtitle="This appears as the seller on every invoice."
      />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-6">
          <div className="space-y-4">
            <GroupLabel>Legal identity</GroupLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="co-name"
                label="Business name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Shown on invoices"
              />
              <Input
                id="co-legal"
                label="Legal name"
                value={form.legalName}
                onChange={(e) => set("legalName", e.target.value)}
                placeholder="Registered legal entity"
              />
              <Input
                id="co-vat"
                label="VAT number"
                hint="15 digits in KSA (optional)"
                value={form.vatNumber}
                error={errors.vatNumber}
                onChange={(e) => set("vatNumber", e.target.value)}
              />
              <Input
                id="co-cr"
                label="Commercial registration (CR)"
                hint="10 digits in KSA (optional)"
                value={form.crNumber}
                error={errors.crNumber}
                onChange={(e) => set("crNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <GroupLabel>Contact</GroupLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="co-email"
                type="email"
                label="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <Input
                id="co-phone"
                label="Phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <GroupLabel>Address</GroupLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="co-address"
                label="Address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
              <Input
                id="co-city"
                label="City"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-cloud">Business type</span>
            <BusinessTypePicker
              value={form.businessType}
              onChange={(id: BusinessTypeId) => set("businessType", id)}
            />
          </div>
        </CardBody>
        <div className="flex justify-end border-t border-hairline px-5 py-4 sm:px-6">
          <Button type="submit">
            <Save className="h-4 w-4" /> Save profile
          </Button>
        </div>
      </form>
    </Card>
  );
}
