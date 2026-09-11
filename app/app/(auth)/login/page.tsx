"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth/auth-client";
import { Sparkles, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/problems";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const isEmail = identifier.includes("@");
      const res = isEmail
        ? await signIn.email({
            email: identifier.trim(),
            password,
          })
        : await signIn.username({
            username: identifier.trim().toLowerCase(),
            password,
          });

      if (res.error) {
        setError(res.error.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#383838] bg-[#262626] p-8 shadow-xl space-y-6 text-white">
        <div className="space-y-2 text-center">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-2">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Sign in to continue your DSA practice and algorithmic playbooks.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="size-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="identifier"
              className="text-xs font-semibold text-zinc-300"
            >
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or username"
              className="w-full rounded-lg border border-[#444444] bg-[#1a1a1a] px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-zinc-300"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#444444] bg-[#1a1a1a] px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[#383838] text-xs text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-semibold"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
