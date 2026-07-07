"use client";

import { useState, type ReactNode } from "react";
import type { Provider } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

/**
 * Social sign-in row. Each provider still has to be enabled in the Supabase
 * dashboard (Authentication → Providers) with real OAuth credentials and
 * `<origin>/auth/callback` registered as a redirect URL — until then the
 * provider bounces back an error, which we toast rather than fail silently.
 * Adding another provider is one entry in PROVIDERS below.
 */

interface ProviderConfig {
  id: Provider;
  label: string;
  icon: ReactNode;
}

const GoogleIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
    />
  </svg>
);

const GitHubIcon = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-bone" aria-hidden="true">
    <path d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-1.87c-3.06.67-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.19 3.2.91.1-.71.38-1.19.7-1.46-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.13a10.4 10.4 0 0 1 5.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.22-2.58 5.15-5.03 5.42.4.34.75 1 .75 2.03v3.01c0 .29.2.64.76.53A11 11 0 0 0 12 1Z" />
  </svg>
);

const PROVIDERS: ProviderConfig[] = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "github", label: "GitHub", icon: GitHubIcon },
];

export function OAuthButtons({ className }: { className?: string }) {
  const toast = useToast();
  const [pending, setPending] = useState<Provider | null>(null);

  async function signIn(config: ProviderConfig) {
    setPending(config.id);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: config.id,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success the browser is already navigating to the provider, so this
    // only runs on failure (e.g. provider not enabled in Supabase yet).
    if (error) {
      setPending(null);
      toast.error(`${config.label} sign-in isn't available yet. ${error.message}`);
    }
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2.5", className)}>
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => signIn(p)}
          disabled={pending !== null}
          aria-label={`Continue with ${p.label}`}
          className={cn(
            "group relative flex h-11 items-center justify-center gap-2 rounded-xl border border-graphite bg-white/[0.04] text-sm font-medium text-cloud backdrop-blur-sm transition-all duration-200",
            "hover:border-[rgba(226,233,244,0.3)] hover:bg-white/[0.07] hover:text-bone",
            "focus-ring disabled:opacity-50",
          )}
        >
          {pending === p.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {p.icon}
              <span>{p.label}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
