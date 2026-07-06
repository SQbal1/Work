import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  UserCircle,
  Fingerprint,
  Building2,
  SlidersHorizontal,
  ShieldCheck,
  KeyRound,
  Database,
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

export interface SettingsSection {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Only shown to signed-in (Supabase) users, not the local demo. */
  authOnly?: boolean;
}

/**
 * Sections on the Settings page. The Sidebar renders these (as scroll-spy
 * anchors) instead of NAV_ITEMS while a settings route is open; each id must
 * match a <section id> on the settings page.
 */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "account", label: "Account", icon: UserCircle },
  { id: "passkeys", label: "Passkeys", icon: Fingerprint, authOnly: true },
  { id: "company", label: "Company profile", icon: Building2 },
  { id: "preferences", label: "Invoice defaults", icon: SlidersHorizontal },
  { id: "vat", label: "VAT & ZATCA", icon: ShieldCheck },
  { id: "zatca-csid", label: "ZATCA CSID", icon: KeyRound },
  { id: "team", label: "Team", icon: Users },
  { id: "data", label: "Data & export", icon: Database },
];
