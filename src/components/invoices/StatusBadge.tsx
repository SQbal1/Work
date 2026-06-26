import { Badge } from "@/components/ui/Badge";
import { getEffectiveStatus, STATUS_META } from "@/lib/status";
import type { Invoice } from "@/types";

/** Status pill that derives "overdue" automatically. Reused everywhere invoices show. */
export function StatusBadge({ invoice }: { invoice: Pick<Invoice, "status" | "dueDate"> }) {
  const meta = STATUS_META[getEffectiveStatus(invoice)];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}
