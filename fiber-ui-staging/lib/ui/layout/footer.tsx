"use client";

import Link from "next/link";
// eslint-disable-next-line import/no-restricted-paths
import { useOnboarding } from "@/lib/onboarding/feature";

export function Footer() {
  const { showOnboarding } = useOnboarding();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <button onClick={showOnboarding} className="hover:text-foreground transition-colors">
              What&apos;s Fiber?
            </button>
            <Link href="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">© 2025 Fiber. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
