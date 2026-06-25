"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button, buttonStyles } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("demo@placeholder.sa");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    toast.success("Signed in (demo)");
    window.setTimeout(() => router.push("/dashboard"), 400);
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your invoicing workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-signal hover:text-key-lime">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          label="Password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-fog">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-hairline bg-ink text-signal" />
            Remember me
          </label>
          <a href="#" className="font-medium text-signal hover:text-key-lime">
            Forgot password?
          </a>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-4">
        <Link href="/dashboard" className={buttonStyles("secondary", "md", "w-full")}>
          Skip — explore the demo
        </Link>
      </div>
    </AuthShell>
  );
}
