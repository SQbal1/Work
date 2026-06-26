import type { VatCategory } from "@/types";

/**
 * VAT categories. Rates reflect KSA today (standard = 15%). These are UI/calc
 * placeholders for the MVP — final compliance review is required before
 * production use.
 */
export const VAT_CATEGORIES: {
  id: VatCategory;
  label: string;
  rate: number;
  hint: string;
}[] = [
  { id: "standard", label: "Standard rate (15%)", rate: 0.15, hint: "Most goods & services" },
  { id: "zero", label: "Zero-rated (0%)", rate: 0, hint: "Exports & specific supplies" },
  { id: "exempt", label: "Exempt", rate: 0, hint: "VAT does not apply" },
];

export function vatRateForCategory(category: VatCategory): number {
  return VAT_CATEGORIES.find((c) => c.id === category)?.rate ?? 0;
}

export function vatCategoryLabel(category: VatCategory): string {
  return VAT_CATEGORIES.find((c) => c.id === category)?.label ?? "—";
}

/** Common net payment terms offered in invoice/settings dropdowns. */
export const DUE_DATE_PRESETS = [
  { label: "Due on receipt", days: 0 },
  { label: "Net 7", days: 7 },
  { label: "Net 14", days: 14 },
  { label: "Net 30", days: 30 },
  { label: "Net 60", days: 60 },
];
