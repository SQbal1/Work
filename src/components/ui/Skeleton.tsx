import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A single shimmering placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[4px] bg-white/[0.04]", className)}>
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

function CardSkeleton({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={cn("rounded-[4px] border border-hairline bg-canvas", className)}>{children}</div>;
}

/** Dashboard-shaped loading state: stat cards + chart + table. */
export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9" />
            </div>
            <Skeleton className="mt-4 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-20" />
          </CardSkeleton>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <CardSkeleton className="p-5 lg:col-span-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-6 h-48 w-full" />
        </CardSkeleton>
        <CardSkeleton className="p-5">
          <Skeleton className="h-5 w-28" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardSkeleton>
      </div>

      <CardSkeleton className="mt-6 p-5">
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </CardSkeleton>
    </div>
  );
}

/** Generic list-page loading state: header + search + table rows. */
export function ListSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>
      <CardSkeleton className="p-5">
        <Skeleton className="h-9 w-full max-w-xs" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardSkeleton>
    </div>
  );
}
