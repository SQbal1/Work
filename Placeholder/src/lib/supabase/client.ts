import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/** Browser-side Supabase client — used by client components (login/signup forms). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Opt into the passkey (WebAuthn) methods — auth.registerPasskey() /
    // signInWithPasskey(). They throw unless this flag is set. Passkeys must
    // also be enabled in the Supabase dashboard (Authentication → Passkeys).
    { auth: { experimental: { passkey: true } } },
  );
}
