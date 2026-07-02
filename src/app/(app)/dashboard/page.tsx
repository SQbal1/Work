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
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stagger, FadeItem, FadeIn, CountUp } from "@/components/ui/Motion";
import { Money } from "@/components/ui/Money";
import { buttonStyles } from "@/components/ui/Button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TopCustomers } from "@/components/dashboard/TopCustomers";
import { ActivityStrip } from "@/components/dashboard/ActivityStrip";
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
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <FadeItem>
          <StatCard
            label="Total invoices"
            value={<CountUp value={m.totalCount} />}
            icon={FileText}
            tone="violet"
            delta={m.issuedDeltaPct}
            spark={m.monthlyIssued}
          />
        </FadeItem>
        <FadeItem>
          <StatCard
            label="Paid"
            value={<CountUp value={m.paidCount} />}
            icon={Wallet}
            tone="green"
            delta={m.revenueDeltaPct}
            spark={m.monthlyPaid}
          />
        </FadeItem>
        <FadeItem>
          <StatCard
            label="Unpaid"
            value={<CountUp value={m.unpaidCount} />}
            icon={Clock}
            tone="amber"
            hint={`${formatCurrency(m.outstanding)} outstanding`}
          />
        </FadeItem>
        <FadeItem>
          <StatCard
            label="Overdue"
            value={<CountUp value={m.overdueCount} />}
            icon={AlertTriangle}
            tone="red"
            hint={m.overdueCount > 0 ? "Review & follow up →" : undefined}
            href={m.overdueCount > 0 ? "/invoices?status=overdue" : undefined}
          />
        </FadeItem>
      </Stagger>

      {/* What changed since you last looked */}
      <ActivityStrip invoices={invoices} />

      {/* Revenue + quick actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2" delay={0.05}>
          <Card>
            <CardHeader
              title="Revenue collected"
              subtitle="From paid invoices (trailing 7 months)"
              action={
                <div className="text-right">
                  <div className="font-mono text-2xl font-semibold tracking-tight text-bone nums-tabular">
                    <CountUp value={m.last30Revenue} format={(n) => <Money amount={n} />} />
                  </div>
                  <div className="text-xs text-fog">last 30 days</div>
                </div>
              }
            />
            <CardBody>
              <RevenueChart data={m.monthly} />
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-hairline pt-4">
                <Metric label="Collection rate" value={`${m.collectionRatePct}%`} />
                <Metric label="Avg. invoice" value={formatCurrency(m.avgInvoiceValue)} />
                <Metric label="Outstanding" value={formatCurrency(m.outstanding)} />
              </div>
            </CardBody>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader title="Quick actions" subtitle="Jump straight in" />
            <CardBody>
              <QuickActions />
            </CardBody>
          </Card>
        </FadeIn>
      </div>

      {/* Recent invoices + top customers */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2" delay={0.05}>
          <Card className="overflow-hidden">
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
                        <Td className="text-right font-mono font-medium text-bone nums-tabular">
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
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader
              title="Top customers"
              subtitle="By billed revenue"
              action={<Trophy className="h-4 w-4 text-key-lime" />}
            />
            <CardBody>
              <TopCustomers rows={m.topCustomers} getCustomer={getCustomer} />
            </CardBody>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-fog">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold text-bone nums-tabular">{value}</div>
    </div>
  );
}
