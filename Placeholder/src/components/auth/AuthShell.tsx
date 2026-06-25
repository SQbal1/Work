import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

/** Centered auth panel on the technical dark canvas. Used by login + signup. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="aurora min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[4px] border border-hairline bg-canvas p-7 backdrop-blur sm:p-8">
          <h1 className="font-display text-2xl font-medium tracking-[0.025em] text-bone">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-fog">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-fog">{footer}</div> : null}
        <p className="mt-6 text-center text-xs text-fog">
          Prototype demo — no real authentication. Your data stays in this browser.
        </p>
      </div>
    </div>
  );
}
