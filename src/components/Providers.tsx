"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/lib/toast";
import { DataProvider } from "@/lib/store";

/** Client providers mounted once in the root layout. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DataProvider>{children}</DataProvider>
    </ToastProvider>
  );
}
