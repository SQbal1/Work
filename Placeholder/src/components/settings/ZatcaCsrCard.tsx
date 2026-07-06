"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Copy, Download, FileKey } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { generateZatcaCsr, getZatcaCsrStatus, type ZatcaCsrStatus } from "@/lib/actions/zatcaCsr";
import type { ZatcaInvoiceTypeSupport } from "@/lib/zatca/csr";

const INVOICE_TYPES: { id: ZatcaInvoiceTypeSupport; label: string }[] = [
  { id: "both", label: "Both" },
  { id: "standard", label: "Standard (B2B)" },
  { id: "simplified", label: "Simplified (B2C)" },
];

/**
 * Step 1 of real ZATCA CSID onboarding: generate a CSR the user submits
 * through ZATCA's Fatoora portal (with an OTP) to request a Compliance CSID.
 * Supabase-only, like the invoice-signing flow — the local demo has no
 * workspace to onboard. See src/lib/zatca/csr.ts for what is and isn't
 * verified about the CSR's field layout.
 */
export function ZatcaCsrCard() {
  const { company, usingSupabase } = useStore();
  const toast = useToast();
  const [status, setStatus] = useState<ZatcaCsrStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vatNumber: company.vatNumber,
    organizationName: company.legalName || company.name,
    branchName: "",
    city: company.city,
    invoiceType: "both" as ZatcaInvoiceTypeSupport,
  });

  useEffect(() => {
    if (!usingSupabase) return;
    getZatcaCsrStatus()
      .then((s) => {
        setStatus(s);
        if (s.status === "csr_generated") {
          setForm({
            vatNumber: s.vatNumber ?? "",
            organizationName: s.organizationName ?? "",
            branchName: s.branchName ?? "",
            city: s.city ?? "",
            invoiceType: s.invoiceType ?? "both",
          });
        }
      })
      .catch(() => {
        /* leave defaults — status is a convenience prefill, not required */
      });
  }, [usingSupabase]);

  if (!usingSupabase) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateZatcaCsr(form);
      setStatus(result);
      toast.success("CSR generated — download it and submit it through ZATCA's Fatoora portal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate the CSR");
    } finally {
      setLoading(false);
    }
  }

  function downloadCsr() {
    if (!status?.csrPem) return;
    const blob = new Blob([status.csrPem], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zatca-compliance.csr";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyCsr() {
    if (!status?.csrPem) return;
    try {
      await navigator.clipboard.writeText(status.csrPem);
      toast.success("CSR copied to clipboard");
    } catch {
      // Clipboard can be blocked (permissions / insecure context) — fall back to Download.
      toast.error("Couldn't copy — use Download .csr instead");
    }
  }

  return (
    <Card>
      <CardHeader
        title="ZATCA CSID onboarding"
        subtitle="Generate a Certificate Signing Request to submit to ZATCA's Fatoora portal."
      />
      <CardBody className="space-y-5">
        <p className="text-sm text-fog">
          This generates a private key and a CSR shaped to ZATCA&rsquo;s documented CSR fields,
          assembled from public ZATCA onboarding references — not yet verified byte-for-byte
          against ZATCA&rsquo;s official template. Submit the CSR through the Fatoora portal (with
          the OTP from your ZATCA account) to request a Compliance CSID. If ZATCA&rsquo;s validator
          rejects a field, that tells us exactly what to correct here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="csr-vat"
              label="VAT number"
              hint="15 digits"
              value={form.vatNumber}
              onChange={(e) => setForm((f) => ({ ...f, vatNumber: e.target.value }))}
            />
            <Input
              id="csr-org"
              label="Organization name"
              value={form.organizationName}
              onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))}
            />
            <Input
              id="csr-branch"
              label="Branch name"
              placeholder="e.g. Riyadh HQ"
              value={form.branchName}
              onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))}
            />
            <Input
              id="csr-city"
              label="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-cloud">Invoice type support</span>
            <div className="flex flex-wrap gap-2">
              {INVOICE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, invoiceType: t.id }))}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition",
                    form.invoiceType === t.id
                      ? "border-signal/40 bg-signal/10 text-signal"
                      : "border-hairline bg-ink text-fog hover:border-graphite",
                  )}
                  aria-pressed={form.invoiceType === t.id}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <FileKey className="h-4 w-4" />
              {loading ? "Generating…" : status?.status === "csr_generated" ? "Regenerate CSR" : "Generate CSR"}
            </Button>
          </div>
        </form>

        {status?.csrPem ? (
          <div className="space-y-3 rounded-[10px] border border-hairline bg-ink p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-bone">CSR ready</span>
              <Badge tone="blue" dot>
                CSR generated
              </Badge>
            </div>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-[8px] bg-canvas p-3 font-mono text-[11px] text-fog">
              {status.csrPem}
            </pre>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={copyCsr}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="secondary" size="sm" onClick={downloadCsr}>
                <Download className="h-4 w-4" /> Download .csr
              </Button>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
