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
      {/* ambient aurora pair behind the panel */}
      <div
        aria-hidden="true"
        className="aurora-blob -top-[20%] left-[10%] h-[46vh] w-[46vw]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(168,255,83,0.08), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="aurora-blob bottom-[0%] right-[6%] h-[40vh] w-[38vw]"
        style={{
          animationDelay: "-7s",
          background: "radial-gradient(ellipse at center, rgba(62,230,160,0.07), transparent 65%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="glass-strong rounded-2xl p-7 shadow-lift sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-bone">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-fog">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="mt-6 text-center text-sm text-fog">{footer}</div> : null}
        <p className="mt-6 text-center text-xs text-fog">
          MVP prototype, not yet a finished commercial product.
        </p>
      </div>
    </div>
  );
}
