"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/lib/ui/data-display/button";
import type { User } from "@supabase/supabase-js";

interface AuthButtonProps {
  user: User | null;
  loading: boolean;
}

export function AuthButton({ user, loading }: AuthButtonProps) {
  const pathname = usePathname();

  // Hide auth button during auth flow
  const isAuthPage = pathname?.startsWith("/auth");

  if (loading) {
    return <div className="h-8 w-24 animate-pulse bg-muted rounded" />;
  }

  // Don't show sign in button on auth pages
  if (isAuthPage && !user) {
    return null;
  }

  return user ? null : ( // Logout button is in the profile page // User is logged in but we don't show anything here
    <Button asChild size="lg" variant={"default"}>
      <Link href="/auth/login">Sign in</Link>
    </Button>
  );
}
