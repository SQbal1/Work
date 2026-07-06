"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { WorkspacePreview } from "@/components/auth/WorkspacePreview";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Input } from "@/components/ui/Input";
import { Button, buttonStyles } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [navigating, startNavigate] = useTransition();
  const [checkEmail, setCheckEmail] = useState(false);

  const passwordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const emailValid = EMAIL_RE.test(form.email);
  const firstName = form.name.trim().split(/\s+/)[0] || "";
  const busy = submitting || navigating;

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don’t match");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, company_name: form.company } },
    });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is required before a session exists.
      setSubmitting(false);
      setCheckEmail(true);
      return;
    }
    toast.success("Account created");
    startNavigate(() => {
      router.push("/onboarding");
      router.refresh();
    });
  }

  if (checkEmail) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a confirmation link to ${form.email}.`}>
        <p className="text-sm text-fog">
          Click the link in that email to activate your account, then come back and sign in.
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
    <AuthShell
      title={firstName ? `Welcome, ${firstName}` : "Create your account"}
      subtitle={
        firstName
          ? "A few details and your workspace is live."
          : "Set up your workspace in a couple of minutes."
      }
      aside={<WorkspacePreview name={form.name} company={form.company} />}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-signal hover:text-key-lime">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-fog">or with email</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="name"
            label="Full name"
            placeholder="e.g. Noura Al-Saud"
            leftIcon={<User className="h-4 w-4" />}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoFocus
            required
          />
          <Input
            id="company"
            label="Company name"
            placeholder="e.g. Noura Consulting"
            leftIcon={<Building2 className="h-4 w-4" />}
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            required
          />
        </div>
        <Input
          id="email"
          type="email"
          label="Work email"
          placeholder="you@company.sa"
          leftIcon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          hint={emailValid ? "Looks good ✓" : undefined}
          required
        />
        <div>
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            minLength={8}
            required
          />
          <div className="mt-2">
            <PasswordStrength password={form.password} />
          </div>
        </div>
        <Input
          id="confirm-password"
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={form.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          error={passwordMismatch ? "Passwords don’t match" : undefined}
          hint={passwordsMatch ? "Passwords match ✓" : undefined}
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" disabled={busy || passwordMismatch}>
          {busy ? (
            "Creating your workspace…"
          ) : (
            <>
              {firstName ? `Let's go, ${firstName}` : "Create account & continue"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-fog">
        By continuing you agree to our placeholder{" "}
        <Link href="/terms" className="text-cloud underline decoration-fog/60 underline-offset-2 hover:text-signal hover:decoration-signal/60">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="text-cloud underline decoration-fog/60 underline-offset-2 hover:text-signal hover:decoration-signal/60">
          Privacy
        </Link>
        .
      </p>
      <div className="mt-2">
        <Link href="/dashboard" className={buttonStyles("ghost", "md", "w-full")}>
          Skip and explore the demo
        </Link>
      </div>
    </AuthShell>
  );
}
