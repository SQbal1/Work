import {
  Briefcase,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  HardHat,
  Laptop,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { BusinessTypeId } from "@/types";

export interface BusinessTypeDef {
  id: BusinessTypeId;
  label: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Supported business types. The MVP is tuned for consulting / freelancers, but
 * the rest are first-class so we can expand after customer discovery.
 * Add a new vertical by appending one entry here.
 */
export const BUSINESS_TYPES: BusinessTypeDef[] = [
  {
    id: "consulting",
    label: "Consulting",
    description: "Advisory, agencies & professional services",
    icon: Briefcase,
  },
  {
    id: "freelancer",
    label: "Freelancer",
    description: "Solo professionals & independent contractors",
    icon: Laptop,
  },
  {
    id: "retail",
    label: "Retail",
    description: "Shops & product-based businesses",
    icon: ShoppingBag,
  },
  {
    id: "logistics",
    label: "Logistics",
    description: "Delivery, shipping & transport",
    icon: Truck,
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Cafés, restaurants & catering",
    icon: UtensilsCrossed,
  },
  {
    id: "construction",
    label: "Construction",
    description: "Contractors & maintenance",
    icon: HardHat,
  },
  {
    id: "other",
    label: "Other",
    description: "Something else, we'll keep it flexible",
    icon: Building2,
  },
];

export function getBusinessType(id: BusinessTypeId): BusinessTypeDef {
  return BUSINESS_TYPES.find((b) => b.id === id) ?? BUSINESS_TYPES[0];
}
