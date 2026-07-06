"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/** Compact currency for the y-axis (e.g. 12k, 1.2M) so ticks stay narrow. */
function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${value}`;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-graphite bg-ink px-3 py-2 shadow-lg">
      <div className="font-mono text-[11px] uppercase tracking-wide text-fog">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold text-bone nums-tabular">
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

/** Themed area chart for monthly collected revenue. */
export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="h-48 w-full">
      {/* debounce avoids ResponsiveContainer's ResizeObserver firing a
          setState synchronously while a parent is mid-render (dev/HMR-only
          React warning; harmless but noisy without this). */}
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a8ff53" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#a8ff53" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="rgba(215,217,221,0.07)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#878c99", fontSize: 11, fontFamily: "var(--font-mono)" }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: "#878c99", fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickFormatter={compact}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "rgba(168,255,83,0.35)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#a8ff53"
            strokeWidth={2}
            fill="url(#revenue-fill)"
            dot={{ r: 2.5, fill: "#a8ff53", strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "#a8ff53", stroke: "#0a0e16", strokeWidth: 2 }}
            isAnimationActive={!reduced}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
