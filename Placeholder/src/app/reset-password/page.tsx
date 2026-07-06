"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button, buttonStyles } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

/**
 * Landing page for the "forgot password" email link. Supabase's recovery
 * link drops the user here with a recovery session already established (the
 * SDK picks the token out of the URL on load), so we just collect a new
 * password and call updateUser. If there's no recovery session (link expired
 * or opened directly), we say so plainly instead of showing a dead form.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // The recovery token is exchanged automatically on load; give it a tick,
    // then confirm a session exists before showing the form.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don’t match");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're all set.");
    router.push("/dashboard");
    router.refresh();
  }

  if (ready && !hasSession) {
    return (
      <AuthShell title="Link expired" subtitle="This password reset link is no longer valid.">
        <p className="text-sm text-fog">
          Reset links are single-use and time-limited. Request a fresh one from the sign-in screen.
        </p>
        <div className="mt-4">
          <Link href="/login" className={buttonStyles("secondary", "md", "w-full")}>
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password to secure your workspace.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <PasswordInput
            id="password"
            label="New password"
            placeholder="At least 8 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoFocus
          />
          <div className="mt-2">
            <PasswordStrength password={password} />
          </div>
        </div>
        <PasswordInput
          id="confirm-password"
          label="Confirm new password"
          placeholder="Re-enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch ? "Passwords do not match" : undefined}
          hint={confirm.length > 0 && !mismatch ? "Passwords match" : undefined}
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" disabled={saving || mismatch || !ready}>
          {saving ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
