"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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

/**
 * Themed area chart for monthly collected revenue. The stroke carries the
 * signal gradient (lime→mint), the current period is marked with a brighter
 * dot, and a dashed reference line shows the trailing average so each period
 * reads as above or below trend rather than as an isolated bar.
 */
export function RevenueChart({
  data,
  average,
}: {
  data: { label: string; value: number }[];
  average?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const lastIndex = data.length - 1;

  const renderDot = (props: any) => {
    const { cx, cy, index } = props;
    if (cx == null || cy == null) return <g key={`d-${index}`} />;
    const isLast = index === lastIndex;
    return (
      <circle
        key={`d-${index}`}
        cx={cx}
        cy={cy}
        r={isLast ? 4.5 : 2.5}
        fill="#a8ff53"
        stroke={isLast ? "#0a0e16" : "none"}
        strokeWidth={isLast ? 2 : 0}
        opacity={isLast ? 1 : 0.5}
      />
    );
  };

  return (
    <div className="h-52 w-full">
      {/* debounce avoids ResponsiveContainer's ResizeObserver firing a
          setState synchronously while a parent is mid-render (dev/HMR-only
          React warning; harmless but noisy without this). */}
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a8ff53" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#a8ff53" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="revenue-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d9f07c" />
              <stop offset="50%" stopColor="#a8ff53" />
              <stop offset="100%" stopColor="#3ee6a0" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(226,233,244,0.05)" />
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
          {typeof average === "number" && average > 0 ? (
            <ReferenceLine y={average} stroke="rgba(226,233,244,0.16)" strokeDasharray="4 4" />
          ) : null}
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#revenue-stroke)"
            strokeWidth={2.5}
            fill="url(#revenue-fill)"
            dot={renderDot}
            activeDot={{ r: 5, fill: "#a8ff53", stroke: "#0a0e16", strokeWidth: 2 }}
            isAnimationActive={!reduced}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
