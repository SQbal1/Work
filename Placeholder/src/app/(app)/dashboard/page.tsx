"use client";

import Link from "next/link";
import {
  FileText,
  Wallet,
  Clock,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/Button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { useStore } from "@/lib/store";
import { computeDashboard, invoiceTotal } from "@/lib/metrics";
import { formatCurrency, formatDate } from "@/lib/format";

export default function DashboardPage() {
  const { invoices, company, getCustomer } = useStore();
  const m = computeDashboard(invoices);

  const recent = [...invoices]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`A quick overview of ${company.name || "your business"}.`}
        actions={
          <Link href="/invoices/new" className={buttonStyles("primary", "md")}>
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total invoices" value={m.totalCount} icon={FileText} tone="violet" />
        <StatCard label="Paid" value={m.paidCount} icon={Wallet} tone="green" />
        <StatCard
          label="Unpaid"
          value={m.unpaidCount}
          icon={Clock}
          tone="amber"
          hint={`${formatCurrency(m.outstanding)} outstanding`}
        />
        <StatCard label="Overdue" value={m.overdueCount} icon={AlertTriangle} tone="red" />
      </div>

      {/* Revenue + quick actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly revenue"
            subtitle="Collected from paid invoices (last 7 months)"
            action={
              <div className="text-right">
                <div className="font-mono text-2xl font-semibold tracking-tight text-bone">
                  {formatCurrency(m.thisMonthRevenue)}
                </div>
                <div className="text-xs text-fog">this month</div>
              </div>
            }
          />
          <CardBody>
            <RevenueChart data={m.monthly} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick actions" subtitle="Jump straight in" />
          <CardBody>
            <QuickActions />
          </CardBody>
        </Card>
      </div>

      {/* Recent invoices */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader
          title="Recent invoices"
          subtitle="Your latest activity"
          action={
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 text-sm font-medium text-signal hover:text-key-lime"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />
        {recent.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description="Create your first invoice and it will show up here."
              action={
                <Link href="/invoices/new" className={buttonStyles("primary", "md")}>
                  <Plus className="h-4 w-4" /> New invoice
                </Link>
              }
            />
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Invoice</Th>
                <Th>Customer</Th>
                <Th className="hidden sm:table-cell">Issued</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recent.map((inv) => {
                const customer = getCustomer(inv.customerId);
                return (
                  <Tr key={inv.id} className="hover:bg-white/[0.03]">
                    <Td>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-mono font-medium text-signal hover:text-key-lime"
                      >
                        {inv.number}
                      </Link>
                    </Td>
                    <Td className="text-cloud">{customer?.company || customer?.name || "—"}</Td>
                    <Td className="hidden font-mono text-fog sm:table-cell">{formatDate(inv.issueDate)}</Td>
                    <Td className="text-right font-mono font-medium text-bone">
                      {formatCurrency(invoiceTotal(inv))}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end">
                        <StatusBadge invoice={inv} />
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
