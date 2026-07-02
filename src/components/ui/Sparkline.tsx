import { cn } from "@/lib/cn";

/**
 * Tiny dependency-free SVG sparkline. Draws a smoothed area+line over the given
 * values, scaled to fit. Purely decorative — hidden from assistive tech.
 */
export function Sparkline({
  data,
  className,
  stroke = "var(--color-signal-lime)",
  width = 96,
  height = 28,
}: {
  data: number[];
  className?: string;
  stroke?: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 3;
  const usableH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + (1 - (v - min) / span) * usableH;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const gradId = `spark-${data.join("-").replace(/[^0-9]/g, "").slice(0, 10)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
