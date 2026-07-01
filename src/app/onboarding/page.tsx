"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  User,
  Package,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BusinessTypePicker } from "@/components/settings/BusinessTypePicker";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import type { BusinessTypeId } from "@/types";

const STEPS = [
  { n: 1, label: "Business", icon: Building2 },
  { n: 2, label: "Company", icon: FileText },
  { n: 3, label: "Customer", icon: User },
  { n: 4, label: "Service", icon: Package },
  { n: 5, label: "Finish", icon: ShieldCheck },
];

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    ready,
    company,
    hasWorkspace,
    createWorkspace,
    updateCompany,
    addCustomer,
    addProduct,
    setOnboarded,
  } = useStore();

  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<BusinessTypeId>(company.businessType);
  const [companyForm, setCompanyForm] = useState({
    name: company.name,
    vatNumber: company.vatNumber,
    email: company.email,
    phone: company.phone,
    address: company.address,
    city: company.city,
  });
  const [customerForm, setCustomerForm] = useState({ name: "", company: "", email: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "" });

  const canNext = step !== 2 || companyForm.name.trim() !== "";

  async function persistAll() {
    if (!hasWorkspace) {
      await createWorkspace(companyForm.name.trim() || "My Workspace");
    }
    await updateCompany({ ...companyForm, businessType });
    if (customerForm.name.trim()) {
      await addCustomer({
        name: customerForm.name.trim(),
        company: customerForm.company.trim(),
        email: customerForm.email.trim(),
        phone: "",
        vatNumber: "",
        address: "",
        notes: "",
      });
    }
    if (productForm.name.trim() && productForm.price) {
      await addProduct({
        name: productForm.name.trim(),
        description: "",
        unitPrice: parseFloat(productForm.price) || 0,
        vatCategory: "standard",
        active: true,
      });
    }
    await setOnboarded(true);
  }

  async function finish(destination: string) {
    if (!ready) return;
    try {
      await persistAll();
      toast.success("Setup complete — welcome aboard!");
      router.push(destination);
    } catch {
      // store already surfaced an error toast
    }
  }

  return (
    <div className="aurora min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex flex-col items-center">
          <Logo href={null} />
          <h1 className="mt-5 font-display text-2xl font-medium tracking-[0.025em] text-bone">
            Let&apos;s set up your workspace
          </h1>
          <p className="mt-1 text-sm text-fog">Five quick steps. Most are optional.</p>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.n} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition",
                      done
                        ? "bg-signal text-ink"
                        : active
                          ? "bg-signal/10 text-signal ring-1 ring-signal/30"
                          : "bg-ink text-fog ring-1 ring-hairline",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.n}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 hidden text-xs sm:block",
                      active ? "font-medium text-cloud" : "text-fog",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 ? (
                  <div className={cn("mx-2 h-0.5 flex-1 rounded", step > s.n ? "bg-signal" : "bg-hairline")} />
                ) : null}
              </div>
            );
          })}
        </div>

        <Card>
          <CardBody className="min-h-[280px] p-6 sm:p-8">
            {step === 1 ? (
              <StepShell title="What kind of business do you run?" description="We'll tailor the experience. You can change this anytime.">
                <BusinessTypePicker value={businessType} onChange={setBusinessType} />
              </StepShell>
            ) : null}

            {step === 2 ? (
              <StepShell title="Tell us about your business" description="This appears as the seller on your invoices.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="ob-name"
                    label="Business name"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Noura Consulting"
                  />
                  <Input
                    id="ob-vat"
                    label="VAT number"
                    hint="Optional (placeholder)"
                    value={companyForm.vatNumber}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, vatNumber: e.target.value }))}
                  />
                  <Input
                    id="ob-email"
                    type="email"
                    label="Email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, email: e.target.value }))}
                  />
                  <Input
                    id="ob-phone"
                    label="Phone"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                  <Input
                    id="ob-address"
                    label="Address"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, address: e.target.value }))}
                  />
                  <Input
                    id="ob-city"
                    label="City"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
              </StepShell>
            ) : null}

            {step === 3 ? (
              <StepShell title="Add your first customer" description="Optional — you can skip and add customers later.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="ob-cname"
                    label="Name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Contact person"
                  />
                  <Input
                    id="ob-ccompany"
                    label="Company"
                    value={customerForm.company}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, company: e.target.value }))}
                  />
                  <Input
                    id="ob-cemail"
                    type="email"
                    label="Email"
                    className="sm:col-span-2"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </StepShell>
            ) : null}

            {step === 4 ? (
              <StepShell title="Add a service or product" description="Optional — these become reusable invoice line items.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="ob-pname"
                    label="Name"
                    className="sm:col-span-2"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Consultation (per hour)"
                  />
                  <Input
                    id="ob-pprice"
                    type="number"
                    min="0"
                    step="0.01"
                    label="Unit price (SAR)"
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </StepShell>
            ) : null}

            {step === 5 ? (
              <StepShell title="Ready to operate" description="Here's what we've prepared for you.">
                <ul className="space-y-2 text-sm">
                  <SummaryItem label="Business type & company profile" />
                  <SummaryItem label={customerForm.name ? `Customer: ${customerForm.name}` : "Customer — skipped (add later)"} />
                  <SummaryItem label={productForm.name ? `Service: ${productForm.name}` : "Service — skipped (add later)"} />
                </ul>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1" disabled={!ready} onClick={() => finish("/invoices/new")}>
                    <FileText className="h-4 w-4" /> Create my first invoice
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    disabled={!ready}
                    onClick={() => finish("/dashboard")}
                  >
                    Go to dashboard
                  </Button>
                </div>
                {!ready ? (
                  <p className="mt-3 text-center text-xs text-fog">Loading your workspace…</p>
                ) : null}
              </StepShell>
            ) : null}
          </CardBody>
        </Card>

        {/* Navigation */}
        {step < 5 ? (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {step === 3 || step === 4 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s + 1)}>
                  Skip
                </Button>
              ) : null}
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <button
              onClick={() => finish("/dashboard")}
              disabled={!ready}
              className="text-sm font-medium text-fog hover:text-cloud disabled:opacity-50"
            >
              Skip setup and go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-xl font-medium tracking-[0.025em] text-bone">{title}</h2>
      <p className="mt-1 text-sm text-fog">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SummaryItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-signal text-ink">
        <Check className="h-3 w-3" />
      </span>
      <span className="text-cloud">{label}</span>
    </li>
  );
}
