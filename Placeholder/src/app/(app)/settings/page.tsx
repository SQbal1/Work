"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { CompanyProfileCard } from "@/components/settings/CompanyProfileCard";
import { InvoicePreferencesCard } from "@/components/settings/InvoicePreferencesCard";
import { ZatcaCsrCard } from "@/components/settings/ZatcaCsrCard";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { todayISO } from "@/lib/format";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { company, settings, customers, products, invoices, usingSupabase, resetDemoData, clearAllData } =
    useStore();
  const [confirm, setConfirm] = useState<null | "reset" | "clear">(null);

  function exportData() {
    const data = { company, settings, customers, products, invoices, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placeholder-data-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as JSON");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your company, invoice defaults, and data." />

      <CompanyProfileCard />
      <InvoicePreferencesCard />

      {/* VAT & ZATCA placeholder */}
      <Card>
        <CardHeader title="VAT & ZATCA" subtitle="E-invoicing compliance workflow (placeholder)." />
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3 rounded-[10px] border border-key-lime/20 bg-key-lime/10 p-4 text-sm text-key-lime">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Invoice X provides a <strong>ZATCA-ready workflow foundation</strong>. This MVP does not
              connect to official ZATCA systems and is not a claim of compliance. A final compliance
              review is required before production use.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-[10px] border border-hairline bg-ink p-4">
            <div>
              <div className="text-sm font-medium text-bone">ZATCA live connection</div>
              <div className="text-xs text-fog">Submission, clearance & reporting APIs</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="gray" dot>
                Not connected
              </Badge>
              <Button variant="secondary" size="sm" disabled>
                Connect (soon)
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[10px] border border-hairline bg-ink p-4">
            <div>
              <div className="text-sm font-medium text-bone">UBL XML generation & signing</div>
              <div className="text-xs text-fog">
                Development preview: a self-signed local key, not a ZATCA-issued CSID. See each
                invoice&rsquo;s ZATCA card.
              </div>
            </div>
            <Badge tone="blue" dot>
              Simulated
            </Badge>
          </div>
        </CardBody>
      </Card>

      <ZatcaCsrCard />

      {/* Team members placeholder */}
      <Card>
        <CardHeader
          title="Team members"
          subtitle="Invite teammates to collaborate (coming soon)."
          action={
            <Button variant="secondary" size="sm" disabled>
              <Plus className="h-4 w-4" /> Invite
            </Button>
          }
        />
        <CardBody>
          <div className="flex items-center justify-between rounded-[10px] border border-hairline bg-ink p-3">
            <div className="flex items-center gap-3">
              <Avatar name={company.name || "You"} size="sm" />
              <div>
                <div className="text-sm font-medium text-bone">{company.email || "you@company.sa"}</div>
                <div className="text-xs text-fog">Owner</div>
              </div>
            </div>
            <Badge tone="violet">You</Badge>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-fog">
            <Info className="h-3.5 w-3.5" /> Team management is a placeholder in this MVP.
          </p>
        </CardBody>
      </Card>

      {/* Data & export */}
      <Card>
        <CardHeader
          title="Data & export"
          subtitle={
            usingSupabase
              ? "Your data is stored in your workspace."
              : "Your data is stored locally in this browser."
          }
        />
        <CardBody className="space-y-3">
          <DataRow
            title="Export data"
            description="Download everything as a JSON file."
            action={
              <Button variant="secondary" size="sm" onClick={exportData}>
                <Download className="h-4 w-4" /> Export JSON
              </Button>
            }
          />
          {!usingSupabase ? (
            <DataRow
              title="Restore demo data"
              description="Reset to the sample workspace."
              action={
                <Button variant="secondary" size="sm" onClick={() => setConfirm("reset")}>
                  <RotateCcw className="h-4 w-4" /> Restore
                </Button>
              }
            />
          ) : null}
          <DataRow
            title="Clear all data"
            description="Delete customers, products, and invoices."
            action={
              <Button variant="danger" size="sm" onClick={() => setConfirm("clear")}>
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
            }
          />
        </CardBody>
      </Card>

      {/* Confirm modal */}
      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "clear" ? "Clear all data?" : "Restore demo data?"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm === "clear" ? "danger" : "primary"}
              onClick={() => {
                if (confirm === "clear") {
                  clearAllData();
                  toast.success("All data cleared");
                  router.push("/onboarding");
                } else if (confirm === "reset") {
                  resetDemoData();
                  toast.success("Demo data restored");
                }
                setConfirm(null);
              }}
            >
              {confirm === "clear" ? "Clear everything" : "Restore"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-fog">
          {confirm === "clear"
            ? "This permanently deletes all customers, products, and invoices from this browser. You'll be taken to onboarding to set up again."
            : "This replaces your current data with the original sample workspace."}
        </p>
        {confirm === "clear" ? (
          <button
            type="button"
            onClick={exportData}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-signal transition hover:text-key-lime"
          >
            <Download className="h-3.5 w-3.5" /> Export a backup first
          </button>
        ) : null}
      </Modal>
    </div>
  );
}

function DataRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-hairline bg-ink p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-bone">{title}</div>
        <div className="text-xs text-fog">{description}</div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
