"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Building2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button, buttonStyles } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, company_name: form.company } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is required before a session exists.
      setCheckEmail(true);
      return;
    }
    toast.success("Account created");
    router.push("/onboarding");
    router.refresh();
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
      title="Create your account"
      subtitle="Set up your workspace in a couple of minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-signal hover:text-key-lime">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          placeholder="e.g. Noura Al-Saud"
          leftIcon={<User className="h-4 w-4" />}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
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
        <Input
          id="email"
          type="email"
          label="Work email"
          placeholder="you@company.sa"
          leftIcon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account & continue"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-fog">
        By continuing you agree to our placeholder Terms & Privacy.
      </p>
      <div className="mt-2">
        <Link href="/dashboard" className={buttonStyles("ghost", "md", "w-full")}>
          Skip — explore the demo
        </Link>
      </div>
    </AuthShell>
  );
}
