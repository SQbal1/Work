"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, AlertTriangle, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { controlClass, Field } from "@/components/ui/Field";
import { buttonStyles } from "@/components/ui/Button";
import { BUSINESS_TYPES } from "@/data/marketing";
import { brand } from "@/config/brand";
import { track, AnalyticsEvent } from "@/lib/analytics";

/**
 * Lightweight pilot-request form for the marketing /pricing page.
 *
 * Leads are captured via Formspree — no backend of our own. Set the form id in
 * NEXT_PUBLIC_FORMSPREE_ID (e.g. "xyzabcd" from https://formspree.io/f/xyzabcd)
 * and each submission arrives by email + in the Formspree dashboard for review.
 * If the id is unset (local dev / not yet configured), the form gracefully
 * falls back to the original local-success behavior so nothing breaks.
 *
 * This is intentionally a manual pilot request, not an automated signup —
 * no payment, no account creation.
 */

type Status = "idle" | "submitting" | "success" | "error";

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export function PilotRequestForm() {
  const [status, setStatus] = useState<Status>("idle");

  // Fire the success event whenever the success state is shown — covers both
  // the Formspree path and the no-endpoint local fallback.
  useEffect(() => {
    if (status === "success") track(AnalyticsEvent.PilotRequestSuccess);
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track(AnalyticsEvent.PilotRequestSubmitted);
    // Capture the form node + data before any await (the event is pooled).
    const form = e.currentTarget;
    const data = new FormData(form);

    // No endpoint configured → preserve the original local-success UX.
    if (!FORMSPREE_ID) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[10px] border border-hairline bg-ink p-7">
        <div className="flex items-center gap-4 border-b border-hairline pb-5">
          <span
            aria-hidden
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border border-signal/30 bg-gradient-to-b from-signal/[0.12] to-signal/[0.04] text-signal shadow-[0_0_0_1px_rgba(168,255,83,0.04),0_8px_24px_-12px_rgba(168,255,83,0.45)]"
          >
            <span className="absolute inset-0 rounded-[10px] ring-1 ring-inset ring-signal/10" />
            <BadgeCheck className="h-[22px] w-[22px]" strokeWidth={1.6} />
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fog">
              <span>Pilot request</span>
              <span className="text-graphite">/</span>
              <span className="text-signal">Received</span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.02em] text-ash">
              Logged for manual review
            </span>
          </div>
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-bone">
          Pilot request received
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-fog">
          Thanks, we&apos;ll review fit and reply within 24 hours to arrange a short onboarding
          call. Nothing is charged and no account is created automatically; pilot access is set up
          manually with you.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm text-signal transition hover:text-bone"
        >
          Send another request
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[10px] border border-hairline bg-ink p-7"
      noValidate={false}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
        Request pilot access
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input id="name" name="name" label="Name" required placeholder="Your name" autoComplete="name" />
        <Input
          id="company"
          name="company"
          label="Company"
          required
          placeholder="Business name"
          autoComplete="organization"
        />
        <div className="sm:col-span-2">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            required
            placeholder="you@company.sa"
            autoComplete="email"
          />
        </div>
        <Field label="Business type" htmlFor="businessType" required className="sm:col-span-2">
          <select id="businessType" name="businessType" required defaultValue="" className={`${controlClass} h-11`}>
            <option value="" disabled>
              Select one
            </option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Textarea
          id="note"
          name="note"
          label="What's slowing your invoicing down?"
          rows={3}
          placeholder="A sentence on how you invoice today and where it breaks."
        />
      </div>

      {/* Honeypot: bots fill hidden fields, humans never see this. */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {/* Nicer subject line in the Formspree notification email. */}
      <input type="hidden" name="_subject" value={`New pilot request: ${brand.name}`} />

      {status === "error" ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-[10px] border border-mute-red/30 bg-mute-red/[0.07] p-3 text-sm leading-relaxed text-mute-red"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Something went wrong sending your request. Please try again, or email us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline hover:text-bone">
              {brand.supportEmail}
            </a>
            .
          </span>
        </p>
      ) : null}

      <button type="submit" disabled={submitting} className={buttonStyles("primary", "lg", "mt-6 w-full")}>
        {submitting ? (
          "Sending…"
        ) : (
          <>
            Request pilot access <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-3 text-xs leading-relaxed text-fog">
        This sends a manual pilot request, not an automated signup. No payment, no account is
        created yet.
      </p>
    </form>
  );
}
