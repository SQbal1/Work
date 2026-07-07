"use client";

import { useEffect, useState } from "react";
import { Fingerprint, X, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import { passkeyErrorMessage } from "@/lib/passkey";
import { cn } from "@/lib/cn";

const DISMISS_KEY = "ix_passkey_nudge_v1";

/**
 * A quiet, one-time prompt to set up a passkey — shown on the dashboard to a
 * signed-in user whose device can do Touch ID / Face ID and who hasn't added
 * one yet. It self-suppresses forever once added or dismissed, and never shows
 * in the local demo (there's no account to attach a credential to).
 */
export function PasskeyNudge() {
  const { usingSupabase, ready } = useStore();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!usingSupabase || !ready) return;
      if (localStorage.getItem(DISMISS_KEY)) return;
      // Only worth suggesting on a device with a built-in authenticator.
      const supported =
        typeof window !== "undefined" &&
        "PublicKeyCredential" in window &&
        (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false));
      if (cancelled || !supported) return;

      const supabase = createClient();
      const { data } = await supabase.auth.passkey.list();
      if (cancelled) return;
      // Already has one → remember that and never nudge again.
      if (data && data.length > 0) {
        localStorage.setItem(DISMISS_KEY, "has");
        return;
      }
      setShow(true);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [usingSupabase, ready]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "dismissed");
    setShow(false);
  }

  async function add() {
    setAdding(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.registerPasskey();
      if (error) {
        toast.error(passkeyErrorMessage(error.message));
      } else {
        toast.success("Passkey added. Sign in with your fingerprint or face next time.");
        localStorage.setItem(DISMISS_KEY, "has");
        setShow(false);
      }
    } catch (err) {
      toast.error(passkeyErrorMessage(err instanceof Error ? err.message : null));
    }
    setAdding(false);
  }

  if (!show) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-signal/20 bg-signal/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-signal/20 bg-signal/10 text-signal">
          <Fingerprint className="h-5 w-5" />
        </span>
        <div>
          <div className="text-sm font-medium text-bone">Sign in faster next time</div>
          <div className="text-xs text-fog">
            Add a passkey to sign in with Touch ID or Face ID, with no password to remember.
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={add}
          disabled={adding}
          className={cn(
            "inline-flex items-center gap-2 rounded-[10px] bg-signal px-3 py-2 text-sm font-medium text-ink transition hover:bg-key-lime disabled:opacity-60",
          )}
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
          Add a passkey
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="grid h-9 w-9 place-items-center rounded-[10px] text-fog transition hover:bg-white/[0.05] hover:text-cloud"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
