"use client";

import { usePathname } from "next/navigation";
import { UserProfileProvider } from "@/contexts/user-profile-context";
import { OnboardingProvider } from "@/lib/onboarding/feature";
import { AppShell } from "@/lib/navigation/feature/app-shell";
import { PostHogPageView, PostHogUserIdentify } from "@/lib/analytics/feature";

import { Suspense } from "react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const isWaitlistRoute = pathname === "/waitlist";

  if (isAuthRoute || isWaitlistRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 via-gray-900 to-black">
        {children}
      </div>
    );
  }

  return (
    <UserProfileProvider>
      <OnboardingProvider>
        <Suspense fallback={null}>
          <PostHogPageView />
          <PostHogUserIdentify />
        </Suspense>
        <AppShell>{children}</AppShell>
      </OnboardingProvider>
    </UserProfileProvider>
  );
}
