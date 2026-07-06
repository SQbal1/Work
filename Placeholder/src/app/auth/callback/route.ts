import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (and magic-link) callback. Providers redirect here with a `?code`
 * that we exchange for a session cookie, then send the user on. New users
 * (no workspace membership yet) go to onboarding; returning users to the
 * dashboard — mirroring the middleware's own workspace check so the two
 * never disagree.
 *
 * Requires the matching provider to be enabled in the Supabase dashboard
 * (Authentication → Providers) with this route registered as an allowed
 * redirect URL. Until then, providers bounce back with an `error` param,
 * which we surface on the login page rather than failing silently.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error_description") || searchParams.get("error");
  const next = searchParams.get("next");

  if (error) {
    return NextResponse.redirect(`${origin}/login?authError=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?authError=${encodeURIComponent("Missing authorization code")}`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?authError=${encodeURIComponent(exchangeError.message)}`);
  }

  // An explicit `next` wins (used for deep links), otherwise route by whether
  // the user already has a workspace — same logic as middleware.ts.
  if (next && next.startsWith("/")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = "/onboarding";
  if (user) {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (membership) destination = "/dashboard";
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
