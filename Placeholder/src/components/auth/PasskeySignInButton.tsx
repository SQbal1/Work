"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import { passkeyErrorMessage } from "@/lib/passkey";
import { cn } from "@/lib/cn";

/**
 * Passwordless sign-in with a passkey (Touch ID / Face ID / security key).
 * Uses Supabase's discoverable-credential flow, so the user picks their
 * account from the OS prompt — no email needed up front. Needs passkeys
 * enabled in the Supabase dashboard; until then it fails with a calm toast.
 */
export function PasskeySignInButton({ className }: { className?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (error || !data?.session) {
        setLoading(false);
        toast.error(passkeyErrorMessage(error?.message ?? "no passkey"));
        return;
      }
      toast.success("Signed in");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setLoading(false);
      toast.error(passkeyErrorMessage(err instanceof Error ? err.message : null));
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-graphite bg-white/[0.04] text-sm font-medium text-cloud backdrop-blur-sm transition-all duration-200",
        "hover:border-[rgba(226,233,244,0.3)] hover:bg-white/[0.07] hover:text-bone focus-ring disabled:opacity-50",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Fingerprint className="h-4 w-4 text-signal" />
      )}
      Sign in with a passkey
    </button>
  );
}
