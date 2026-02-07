"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { trackEvent } from "@/lib/analytics/posthog";
import { decodeEmailParam, encodeEmailParam } from "@/lib/utils/url-params";
// User profile context no longer needed - auth drawer only handles sign in/setup flow
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/lib/ui/overlay/sheet";
import { Button } from "@/lib/ui/data-display/button";
// No additional icons needed

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  offerTitle?: string;
}

export function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Decode masked email from "h" parameter
  const maskedEmail = searchParams.get("h");
  const emailFromUrl = maskedEmail ? decodeEmailParam(maskedEmail) : null;

  // Get the current URL for redirect after auth
  const redirectUrl =
    typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname;

  // Auth drawer should only be shown when setup is incomplete
  // If user can continue, the drawer shouldn't be triggered at all

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto" data-testid="auth-drawer">
        <SheetHeader className="text-center">
          <SheetTitle className="text-2xl">
            {user
              ? "Complete setup to continue"
              : emailFromUrl
                ? "New session detected"
                : "Sign in to continue"}
          </SheetTitle>
          <SheetDescription className="text-base">
            {/* {offerTitle && (
              <span className="block text-foreground font-medium mb-2">
                &ldquo;{offerTitle}&rdquo;
              </span>
            )} */}
            {user
              ? "Complete your wallet and payout setup to access this offer."
              : emailFromUrl
                ? `Verify your identity as ${emailFromUrl} to continue`
                : "You need to sign in to access this offer and start earning tokens."}
          </SheetDescription>
          <SheetFooter>
            <div className="flex justify-center">
              <Button
                size={"lg"}
                asChild
                onClick={() => {
                  if (user) {
                    trackEvent.onboardingPayoutsRequiredClicked({
                      source: "auth_drawer",
                    });
                  }
                }}
              >
                <Link
                  href={
                    user
                      ? `/profile?redirectTo=${encodeURIComponent(redirectUrl)}`
                      : emailFromUrl
                        ? `/auth/login?h=${encodeURIComponent(encodeEmailParam(emailFromUrl))}&redirectTo=${encodeURIComponent(redirectUrl)}`
                        : `/auth/login?redirectTo=${encodeURIComponent(redirectUrl)}`
                  }
                >
                  {user ? "Complete Setup" : emailFromUrl ? "Sign In" : "Sign In"}
                </Link>
              </Button>
            </div>
          </SheetFooter>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
