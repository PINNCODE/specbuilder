"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { ReactNode } from "react";

interface HeaderProps {
  actions?: ReactNode;
}

export function Header({ actions }: HeaderProps) {
  const { isSignedIn, user } = useUser();

  return (
    <header className="flex items-center justify-between p-6 max-w-6xl mx-auto bg-[var(--background)]">
      <Link href="/" className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-amber-400" />
        <span className="text-xl font-bold">Spec Builder</span>
      </Link>

      <div className="flex items-center gap-4">
        {actions}
        <ThemeToggle />
        {!isSignedIn && (
          <SignInButton>
            <button className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:scale-105 transition-transform cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        )}
        {isSignedIn && (
          <div className="flex items-center gap-3">
            {user?.fullName && (
              <span className="text-sm font-medium">{user.fullName}</span>
            )}
            <UserButton />
          </div>
        )}
      </div>
    </header>
  );
}