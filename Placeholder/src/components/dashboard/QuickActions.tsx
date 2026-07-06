import Link from "next/link";
import { FilePlus2, UserPlus, PackagePlus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const actions = [
  {
    href: "/invoices/new",
    label: "Create invoice",
    description: "Start a new invoice",
    icon: FilePlus2,
    primary: true,
  },
  {
    href: "/customers#new",
    label: "Add customer",
    description: "Save their details",
    icon: UserPlus,
    primary: false,
  },
  {
    href: "/products#new",
    label: "Add service or product",
    description: "Add to your catalogue",
    icon: PackagePlus,
    primary: false,
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              "group flex items-center gap-3 rounded-[10px] border p-3 transition",
              a.primary
                ? "border-signal/30 bg-signal/10 hover:bg-signal/15"
                : "border-hairline bg-ink hover:border-graphite",
            )}
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border",
                a.primary ? "border-signal bg-signal text-ink" : "border-hairline bg-canvas text-fog",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-bone">{a.label}</span>
              <span className="block text-xs text-fog">{a.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-fog transition group-hover:translate-x-0.5 group-hover:text-cloud" />
          </Link>
        );
      })}
    </div>
  );
}
