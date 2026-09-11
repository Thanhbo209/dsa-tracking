"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/auth-client";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DsaLogo } from "@/components/brand/DsaLogo";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
      setError(
        "Username must be 3-20 characters long and contain only letters, numbers, underscores, or hyphens.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        username: cleanUsername,
      });

      if (res.error) {
        setError(res.error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      router.push("/problems");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#383838] bg-[#262626] p-8 shadow-xl space-y-6 text-white">
        <div className="space-y-3 text-center">
          <div className="mb-2 flex justify-center">
            <Link href="/problems" className="inline-block hover:opacity-90 transition-opacity">
              <DsaLogo size="xl" priority className="h-12 w-auto" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Build your personal DSA playbook and public engineering profile.
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
              htmlFor="name"
              className="text-xs font-semibold text-zinc-300"
            >
              Full Name / Display Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Thanh Pham"
              className="w-full rounded-lg border border-[#444444] bg-[#1a1a1a] px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-xs font-semibold text-zinc-300"
            >
              Username (for your public profile /u/username)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
                @
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="thanhcow"
                className="w-full rounded-lg border border-[#444444] bg-[#1a1a1a] pl-8 pr-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none font-mono transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-zinc-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#444444] bg-[#1a1a1a] px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-zinc-300"
            >
              Password (min. 8 characters)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Sign up</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[#383838] text-xs text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
