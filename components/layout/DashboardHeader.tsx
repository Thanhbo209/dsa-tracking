"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/auth-client";
import { LogOut, User as UserIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DsaLogo } from "@/components/brand/DsaLogo";

interface DashboardHeaderProps {
  user: {
    name: string;
    username: string | null;
    email: string;
    image: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  return (
    <header className="border-b border-[#383838] bg-[#222222]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-14 flex items-center justify-between">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/problems"
            className="flex items-center gap-2.5 font-bold text-base text-white hover:opacity-90 transition-opacity"
          >
            <DsaLogo size="md" priority className="h-7 w-auto" />
            <span className="tracking-tight">DSA Tracking</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-xs font-medium">
            <Link
              href="/problems"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Problems
            </Link>
            {user.username && (
              <Link
                href={`/u/${user.username}`}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="size-3.5 text-amber-400" />
                <span>My Public Playbook</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right: User identity & Logout */}
        <div className="flex items-center gap-3">
          {user.username ? (
            <Link
              href={`/u/${user.username}`}
              className="flex items-center gap-2 rounded-full border border-[#444444] bg-[#1e1e1e] px-3 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              <UserIcon className="size-3.5 text-zinc-400" />
              <span className="hidden sm:inline">{user.name}</span>
              <span className="font-mono text-[11px] text-zinc-500">
                @{user.username}
              </span>
            </Link>
          ) : (
            <span className="text-xs text-zinc-400">{user.name}</span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
