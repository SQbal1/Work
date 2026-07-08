"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  Info,
  LogOut,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { CompanyProfileCard } from "@/components/settings/CompanyProfileCard";
import { InvoicePreferencesCard } from "@/components/settings/InvoicePreferencesCard";
import { InvoiceTemplateCard } from "@/components/settings/InvoiceTemplateCard";
import { PasskeysCard } from "@/components/settings/PasskeysCard";
import { ZatcaCsrCard } from "@/components/settings/ZatcaCsrCard";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

function AccountCard() {
  const router = useRouter();
  const toast = useToast();
  const { usingSupabase } = useStore();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!usingSupabase) return;
    // Read the email off the local session (no network round-trip) so it
    // appears immediately instead of after a getUser() request.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
  }, [usingSupabase]);

  async function onSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      toast.error(error.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader
        title="Account"
        subtitle={usingSupabase ? "Manage your sign-in session." : "You're exploring the demo."}
      />
      <CardBody>
        <div className="flex flex-col gap-3 rounded-[10px] border border-hairline bg-ink p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-bone">
              {usingSupabase ? email ?? "Signed in" : "No account, local demo only"}
            </div>
            <div className="text-xs text-fog">
              {usingSupabase
                ? "Signing out ends this session on this device."
                : "Create a free account to save your data to the cloud."}
            </div>
          </div>
          {usingSupabase ? (
            <Button variant="secondary" size="sm" onClick={onSignOut} disabled={signingOut}>
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          ) : (
            <Link href="/signup" className={buttonStyles("secondary", "sm")}>
              Create a free account
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

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
    a.download = `invoice-x-data-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as JSON");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your company, invoice defaults, and data." />

      <section id="account" className="scroll-mt-24">
        <AccountCard />
      </section>

      {usingSupabase ? (
        <section id="passkeys" className="scroll-mt-24">
          <PasskeysCard />
        </section>
      ) : null}

      <section id="company" className="scroll-mt-24">
        <CompanyProfileCard />
      </section>
      <section id="preferences" className="scroll-mt-24">
        <InvoicePreferencesCard />
      </section>
      <section id="template" className="scroll-mt-24">
        <InvoiceTemplateCard />
      </section>

      {/* VAT & ZATCA placeholder */}
      <Card id="vat" className="scroll-mt-24">
        <CardHeader title="VAT & ZATCA" subtitle="E-invoicing compliance workflow (preview)." />
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

      <section id="zatca-csid" className="scroll-mt-24">
        <ZatcaCsrCard />
      </section>

      {/* Team members placeholder */}
      <Card id="team" className="scroll-mt-24">
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
            <Info className="h-3.5 w-3.5" /> Team invites aren&apos;t available yet in this MVP.
          </p>
        </CardBody>
      </Card>

      {/* Data & export */}
      <Card id="data" className="scroll-mt-24">
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
