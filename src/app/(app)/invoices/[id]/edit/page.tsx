import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  return <InvoiceBuilder invoiceId={params.id} />;
}
