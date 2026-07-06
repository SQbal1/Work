"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasskeySignInButton } from "@/components/auth/PasskeySignInButton";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button, buttonStyles } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [navigating, startNavigate] = useTransition();
  const busy = submitting || navigating;

  // Surface OAuth callback failures (auth/callback redirects here with ?authError=…),
  // then strip the param so a refresh doesn't re-toast it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");
    if (authError) {
      toast.error(authError);
      window.history.replaceState({}, "", "/login");
    }
    // Warm the next screens so the post-login jump feels instant.
    router.prefetch("/dashboard");
    router.prefetch("/onboarding");
  }, [router, toast]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    startNavigate(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  async function onForgotPassword() {
    if (!email.trim()) {
      toast.error("Enter your email above first, then tap “Forgot password?”");
      document.getElementById("email")?.focus();
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Reset link sent to ${email.trim()}. Check your inbox.`);
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up right where you left off."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-signal hover:text-key-lime">
            Create one
          </Link>
        </>
      }
    >
      <OAuthButtons />
      <PasskeySignInButton className="mt-2.5" />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-fog">or with email</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@company.sa"
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />
        <PasswordInput
          id="password"
          label="Password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-fog">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-hairline bg-ink accent-signal" />
            Remember me
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="font-medium text-signal transition-colors hover:text-key-lime"
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            "Signing you in…"
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-4">
        <Link href="/dashboard" className={buttonStyles("secondary", "md", "w-full")}>
          Skip and explore the demo
        </Link>
      </div>
    </AuthShell>
  );
}
