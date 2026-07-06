"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Copy, Download, FileKey, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { generateZatcaCsr, getZatcaCsrStatus, requestZatcaCompliance, type ZatcaCsrStatus } from "@/lib/actions/zatcaCsr";
import type { ZatcaCsrEnvironment, ZatcaInvoiceTypeSupport } from "@/lib/zatca/csr";

const INVOICE_TYPES: { id: ZatcaInvoiceTypeSupport; label: string }[] = [
  { id: "both", label: "Both" },
  { id: "standard", label: "Standard (B2B)" },
  { id: "simplified", label: "Simplified (B2C)" },
];

const ENVIRONMENTS: { id: ZatcaCsrEnvironment; label: string }[] = [
  { id: "simulation", label: "Simulation" },
  { id: "production", label: "Production" },
];

/**
 * Real ZATCA CSID onboarding: (1) generate a CSR the user submits through
 * ZATCA's Fatoora portal (with an OTP) to request a Compliance CSID, then
 * (2) exchange that OTP for the actual CSID via ZATCA's live API. Supabase-
 * only, like the invoice-signing flow — the local demo has no workspace to
 * onboard. See src/lib/zatca/csr.ts and complianceCsid.ts for what is and
 * isn't verified about the request shape.
 */
export function ZatcaCsrCard() {
  const { company, usingSupabase } = useStore();
  const toast = useToast();
  const [status, setStatus] = useState<ZatcaCsrStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [requestingCsid, setRequestingCsid] = useState(false);
  const [form, setForm] = useState({
    vatNumber: company.vatNumber,
    organizationName: company.legalName || company.name,
    branchName: "",
    city: company.city,
    invoiceType: "both" as ZatcaInvoiceTypeSupport,
    environment: "simulation" as ZatcaCsrEnvironment,
  });

  useEffect(() => {
    if (!usingSupabase) return;
    getZatcaCsrStatus()
      .then((s) => {
        setStatus(s);
        if (s.status !== "not_started") {
          setForm({
            vatNumber: s.vatNumber ?? "",
            organizationName: s.organizationName ?? "",
            branchName: s.branchName ?? "",
            city: s.city ?? "",
            invoiceType: s.invoiceType ?? "both",
            environment: s.environment ?? "simulation",
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
      setOtp("");
      toast.success("CSR generated. Download it and submit it through ZATCA's Fatoora portal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate the CSR");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestCompliance(e: FormEvent) {
    e.preventDefault();
    setRequestingCsid(true);
    try {
      const result = await requestZatcaCompliance(otp);
      setStatus(result);
      setOtp("");
      toast.success("Compliance CSID received from ZATCA");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ZATCA rejected the request");
    } finally {
      setRequestingCsid(false);
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
      toast.error("Couldn't copy. Use Download .csr instead");
    }
  }

  const hasCsid = status?.status === "compliance_csid_received";

  return (
    <Card>
      <CardHeader
        title="ZATCA CSID onboarding"
        subtitle="Generate a Certificate Signing Request, then exchange it for a real Compliance CSID."
      />
      <CardBody className="space-y-5">
        <p className="text-sm text-fog">
          This generates a private key and a CSR shaped to ZATCA&rsquo;s documented CSR fields,
          cross-checked against Microsoft&rsquo;s published Saudi e-invoicing onboarding guide, though
          not yet verified against a live ZATCA submission from this codebase. Submit the CSR through
          the Fatoora portal (with an OTP from your ZATCA account), then paste that OTP below to
          request a Compliance CSID directly from ZATCA. If ZATCA&rsquo;s validator rejects a field,
          that tells us exactly what to correct here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-cloud">Environment</span>
            <div className="flex flex-wrap gap-2">
              {ENVIRONMENTS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, environment: e.id }))}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition",
                    form.environment === e.id
                      ? e.id === "production"
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                        : "border-signal/40 bg-signal/10 text-signal"
                      : "border-hairline bg-ink text-fog hover:border-graphite",
                  )}
                  aria-pressed={form.environment === e.id}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-fog">
              {form.environment === "simulation"
                ? "Recommended first: tests the full onboarding flow with a real OTP against ZATCA's pre-production environment."
                : "Live: this requests a real Production-track Compliance CSID. Only use once Simulation has worked end-to-end."}
            </p>
          </div>

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
              hint={form.environment === "simulation" ? "Ignored in Simulation, where ZATCA requires a fixed CN" : undefined}
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
              {loading ? "Generating…" : status?.status && status.status !== "not_started" ? "Regenerate CSR" : "Generate CSR"}
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

        {status?.csrPem ? (
          <form onSubmit={handleRequestCompliance} className="space-y-3 border-t border-hairline pt-5">
            <div>
              <span className="mb-2 block text-sm font-medium text-cloud">Compliance CSID</span>
              <p className="text-xs text-fog">
                Submit the CSR above through ZATCA&rsquo;s Fatoora portal to generate an OTP, then
                paste it here. OTPs are single-use and expire about an hour after ZATCA issues them.
              </p>
            </div>
            {hasCsid ? (
              <div className="space-y-2 rounded-[10px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
                    <ShieldCheck className="h-4 w-4" /> Compliance CSID received
                  </span>
                  <Badge tone="green" dot>
                    Live from ZATCA
                  </Badge>
                </div>
                <div className="text-xs text-fog">
                  Request ID <span className="font-mono text-bone">{status.zatcaRequestId}</span> ·{" "}
                  {status.environment === "production" ? "Production" : "Simulation"}
                </div>
                <p className="text-xs text-fog">
                  Next: run ZATCA&rsquo;s compliance checks (sample invoice submissions) using this
                  CSID, then request a Production CSID (not yet built).
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[12rem] flex-1">
                  <Input id="csr-otp" label="OTP from Fatoora" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
                <Button type="submit" disabled={requestingCsid || !otp.trim()}>
                  <ShieldCheck className="h-4 w-4" />
                  {requestingCsid ? "Requesting…" : "Request Compliance CSID"}
                </Button>
              </div>
            )}
          </form>
        ) : null}
      </CardBody>
    </Card>
  );
}
