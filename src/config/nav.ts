import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Primary app navigation. Add a screen by adding a route + an entry here.
 * Settings is deliberately not listed — it's reached via the gear icon on the
 * company card at the bottom of the sidebar instead.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Products & Services", icon: Package },
];
