"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Receipt,
  UserPlus,
  PackagePlus,
  FileText,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn, CountUp } from "@/components/ui/Motion";
import { Money } from "@/components/ui/Money";
import { RiyalSymbol } from "@/components/ui/RiyalSymbol";
import { buttonStyles } from "@/components/ui/Button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TopCustomers } from "@/components/dashboard/TopCustomers";
import { ActivityStrip } from "@/components/dashboard/ActivityStrip";
import { PasskeyNudge } from "@/components/dashboard/PasskeyNudge";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { useStore } from "@/lib/store";
import { computeDashboard, invoiceTotal } from "@/lib/metrics";
import { formatCurrency, formatAmount, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Date eyebrow + greeting + a live one-line fact, with the primary action. */
function GreetingHeader({ fact }: { fact: ReactNode }) {
  // Resolve time on the client so the greeting can't cause a hydration mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const greeting = now ? greetingFor(now.getHours()) : "Welcome back";
  const dateLabel = now
    ? new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(now)
    : " ";

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-fog">{dateLabel}</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-bone sm:text-[1.7rem]">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-fog">{fact}</p>
      </div>
      <Link href="/invoices/new" className={buttonStyles("primary", "md")}>
        <Plus className="h-4 w-4" /> New invoice
      </Link>
    </header>
  );
}

/** A quiet secondary metric — no icon chip, no accent, just label + figure. */
function QuietStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-ink/50 px-4 py-3.5">
      <div className="text-xs font-medium text-fog">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold tracking-tight text-bone nums-tabular">
        {value}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { invoices, company, getCustomer, usingSupabase } = useStore();
  const m = computeDashboard(invoices);

  // Real (signed-in) workspaces with no data get a confident first-run, not a
  // wall of zeros. The seeded local demo always has data, so this never shows
  // there.
  if (usingSupabase && invoices.length === 0) {
    return <FirstRunDashboard />;
  }

  const recent = [...invoices].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);
  const avgRevenue = m.monthly.length
    ? m.monthly.reduce((s, p) => s + p.value, 0) / m.monthly.length
    : 0;

  const rate = m.collectionRatePct;
  const rateText = rate >= 90 ? "text-signal" : rate >= 70 ? "text-warm-gold" : "text-mute-red";
  const rateBar = rate >= 90 ? "bg-signal" : rate >= 70 ? "bg-warm-gold" : "bg-mute-red";

  const openLabel = m.unpaidCount === 1 ? "invoice" : "invoices";
  const fact =
    m.outstanding > 0
      ? `You're owed ${formatCurrency(m.outstanding)} across ${m.unpaidCount} open ${openLabel}${
          m.overdueCount > 0 ? `, ${m.overdueCount} overdue` : ""
        }.`
      : m.totalCount > 0
        ? "You're all caught up. Nothing outstanding right now."
        : `Here's how ${company.name || "your business"} is doing.`;

  const revUp = typeof m.revenueDeltaPct === "number" && m.revenueDeltaPct >= 0;

  return (
    <div>
      <GreetingHeader fact={fact} />

      <PasskeyNudge />

      {/* Hero band — money at risk (left) and the collected figure (right). */}
      <FadeIn>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Outstanding */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-ink p-6 shadow-card lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-fog">Outstanding</div>
                <div className="mt-2 font-mono text-3xl font-semibold tracking-tight text-bone nums-tabular sm:text-4xl">
                  <CountUp value={m.outstanding} format={(n) => <Money amount={n} />} />
                </div>
                <div className="mt-1 text-sm text-fog">
                  across {m.unpaidCount} open {openLabel}
                </div>
              </div>
              {m.overdueCount > 0 ? (
                <Link
                  href="/invoices?status=overdue"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-mute-red/30 bg-mute-red/10 px-3 py-1.5 text-xs font-medium text-mute-red transition hover:bg-mute-red/[0.16]"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {m.overdueCount} overdue
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fog">Collection rate</span>
                <span className={cn("font-mono font-semibold nums-tabular", rateText)}>{rate}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", rateBar)}
                  style={{ width: `${Math.max(4, rate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Collected — the one gradient focal point on the screen */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-ink p-6 shadow-card">
            <div>
              <div className="text-sm font-medium text-fog">Collected · last 30 days</div>
              <div className="mt-2 font-mono text-3xl font-semibold tracking-tight nums-tabular sm:text-4xl">
                <span className="sr-only">{formatCurrency(m.last30Revenue)}</span>
                <span aria-hidden="true" className="inline-flex items-baseline gap-[0.18em]">
                  <RiyalSymbol className="text-signal" />
                  <span className="text-gradient-x">
                    <CountUp value={m.last30Revenue} format={(n) => formatAmount(n)} />
                  </span>
                </span>
              </div>
            </div>
            {typeof m.revenueDeltaPct === "number" ? (
              <div
                className={cn(
                  "mt-4 inline-flex items-center gap-1 text-xs font-medium",
                  revUp ? "text-signal" : "text-mute-red",
                )}
              >
                {revUp ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span className="nums-tabular">{Math.abs(m.revenueDeltaPct)}%</span>
                <span className="text-fog">vs the prior 30 days</span>
              </div>
            ) : (
              <div className="mt-4 text-xs text-fog">Your first 30-day window</div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Secondary stats — quiet, no accent rainbow */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuietStat label="Total invoices" value={m.totalCount} />
        <QuietStat label="Paid" value={m.paidCount} />
        <QuietStat label="Unpaid" value={m.unpaidCount} />
        <QuietStat label="Avg. invoice" value={formatCurrency(m.avgInvoiceValue)} />
      </div>

      {/* What changed since you last looked */}
      <ActivityStrip invoices={invoices} />

      {/* Revenue trend + quick actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue trend"
            bordered={false}
            action={
              <span className="flex items-center gap-2 text-xs text-fog">
                <span className="inline-block h-px w-4 border-t border-dashed border-fog/50" />
                avg {formatCurrency(avgRevenue)}
              </span>
            }
          />
          <CardBody className="pt-0">
            <RevenueChart data={m.monthly} average={avgRevenue} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick actions" bordered={false} />
          <CardBody className="pt-0">
            <QuickActions />
          </CardBody>
        </Card>
      </div>

      {/* Recent invoices + top customers */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader
            title="Recent invoices"
            bordered={false}
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
            <CardBody className="pt-0">
              <EmptyState
                icon={Receipt}
                title="No invoices yet"
                description="Your first invoice takes about a minute."
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

        <Card>
          <CardHeader title="Top customers" bordered={false} />
          <CardBody className="pt-0">
            <TopCustomers rows={m.topCustomers} getCustomer={getCustomer} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/** First-run state for a real workspace with no data yet. */
function FirstRunDashboard() {
  const steps = [
    {
      icon: UserPlus,
      title: "Add your first customer",
      desc: "Save who you bill once, reuse them forever.",
      href: "/customers#new",
    },
    {
      icon: PackagePlus,
      title: "Add a service or product",
      desc: "Build a short catalogue of what you sell.",
      href: "/products#new",
    },
    {
      icon: FileText,
      title: "Create your first invoice",
      desc: "VAT is worked out for you, ready to send.",
      href: "/invoices/new",
    },
  ];

  return (
    <div>
      <GreetingHeader fact="Your workspace is ready. Let's set it up." />

      <PasskeyNudge />

      <div className="glass-strong relative overflow-hidden rounded-2xl p-7 sm:p-9">
        <div className="max-w-xl">
          <h2 className="font-display text-xl font-semibold tracking-tight text-bone sm:text-2xl">
            Send your first invoice
          </h2>
          <p className="mt-2 text-sm text-fog">
            Three quick steps and you are billing clients with VAT-ready invoices.
          </p>
        </div>

        <ol className="mt-7 grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-hairline bg-ink/60 p-4 transition hover:border-graphite hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-signal/30 bg-signal/10 font-mono text-xs font-semibold text-signal">
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 text-fog transition group-hover:text-cloud" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-bone">{s.title}</div>
                    <div className="mt-0.5 text-xs text-fog">{s.desc}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-7">
          <Link href="/invoices/new" className={buttonStyles("primary", "md")}>
            Create your first invoice <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
