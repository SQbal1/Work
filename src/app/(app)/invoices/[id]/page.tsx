"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  MessageCircle,
  Mail,
  CheckCircle2,
  Copy,
  Pencil,
  Trash2,
  FileQuestion,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";

export default function InvoicePreviewPage() {
  const params = useParams<{ id: string }>();
  const id = (params?.id as string) ?? null;
  const router = useRouter();
  const toast = useToast();
  const {
    getInvoice,
    getCustomer,
    company,
    settings,
    markInvoicePaid,
    duplicateInvoice,
    deleteInvoice,
  } = useStore();

  const invoice = getInvoice(id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!invoice) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Invoice not found"
        description="This invoice may have been deleted or the link is incorrect."
        action={
          <Link href="/invoices" className={buttonStyles("primary", "md")}>
            Back to invoices
          </Link>
        }
      />
    );
  }

  const customer = getCustomer(invoice.customerId) ?? null;
  const isPaid = invoice.status === "paid";
  const isDraft = invoice.status === "draft";

  function placeholderSend(channel: string) {
    toast.info(`${channel} sending is a placeholder in this MVP.`);
  }

  function downloadPdf() {
    toast.info("Use your browser's dialog to Save as PDF.");
    // Give the toast a beat, then open the native print dialog.
    window.setTimeout(() => window.print(), 300);
  }

  return (
    <div>
      {/* Top bar */}
      <div className="no-print mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="grid h-10 w-10 place-items-center rounded-[4px] border border-hairline bg-ink text-fog transition hover:border-graphite hover:text-bone"
            aria-label="Back to invoices"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-mono text-xl font-semibold tracking-tight text-bone">{invoice.number}</h1>
            <div className="mt-1">
              <StatusBadge invoice={invoice} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/invoices/${invoice.id}/edit`} className={buttonStyles("secondary", "md")}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <Button onClick={downloadPdf}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document */}
        <div className="lg:col-span-2">
          <div className="print-area overflow-hidden rounded-[4px] border border-hairline bg-ink print:bg-white">
            <InvoiceDocument
              company={company}
              customer={customer}
              number={invoice.number}
              issueDate={invoice.issueDate}
              dueDate={invoice.dueDate}
              status={invoice.status}
              items={invoice.items}
              discountPercent={invoice.discountPercent}
              notes={invoice.notes}
              currency={settings.currency}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="no-print space-y-6">
          <div className="space-y-6 lg:sticky lg:top-20">
            <Card>
              <CardHeader title="Send & share" subtitle="Delivery is a placeholder for now." />
              <CardBody className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={downloadPdf}>
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => placeholderSend("WhatsApp")}
                >
                  <MessageCircle className="h-4 w-4" /> Send via WhatsApp
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => placeholderSend("Email")}
                >
                  <Mail className="h-4 w-4" /> Send via email
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Manage" />
              <CardBody className="space-y-2">
                {!isPaid ? (
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      markInvoicePaid(invoice.id);
                      toast.success(`${invoice.number} marked as paid`);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark as paid
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={async () => {
                    const dup = await duplicateInvoice(invoice.id);
                    if (dup) {
                      toast.success(`Duplicated as ${dup.number}`);
                      router.push(`/invoices/${dup.id}`);
                    }
                  }}
                >
                  <Copy className="h-4 w-4" /> Duplicate
                </Button>
                <Link
                  href={`/invoices/${invoice.id}/edit`}
                  className={buttonStyles("secondary", "md", "w-full justify-start")}
                >
                  <Pencil className="h-4 w-4" /> Edit invoice
                </Link>
                {isDraft ? (
                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete draft
                  </Button>
                ) : null}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete draft invoice?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteInvoice(invoice.id);
                toast.success("Draft deleted");
                router.push("/invoices");
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-fog">
          This permanently removes draft{" "}
          <span className="font-mono font-medium text-bone">{invoice.number}</span>.
        </p>
      </Modal>
    </div>
  );
}
