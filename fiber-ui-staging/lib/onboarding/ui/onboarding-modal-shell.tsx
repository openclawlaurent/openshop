import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/ui/overlay/dialog";
import { Button } from "@/lib/ui/data-display/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface OnboardingModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isLastStep: boolean;
  isLoggedIn?: boolean;
}

/**
 * Onboarding modal shell component
 * Simple, clean design inspired by Polymarket
 */
export function OnboardingModalShell({
  isOpen,
  onClose,
  currentStep,
  totalSteps,
  children,
  onNext,
  onBack,
  onComplete,
  isLastStep,
  isLoggedIn = true,
}: OnboardingModalShellProps) {
  const isFirstStep = currentStep === 1;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden" data-testid="onboarding-modal">
        {/* Visually hidden for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Fiber</DialogTitle>
          <DialogDescription>Get started with crypto rewards</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col max-h-[85vh] overflow-hidden">
          {/* Close button */}
          <div className="absolute top-2 left-2 z-10">
            <button
              onClick={() => onClose()}
              className="p-1.5 rounded-full hover:bg-muted/80 transition-colors bg-background/80 backdrop-blur-sm"
              aria-label="Close onboarding"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Main content - scrollable */}
          <div className="flex-1 overflow-auto">{children}</div>

          {/* Footer - sticky */}
          <div className="border-t bg-background px-4 py-3 shrink-0">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-3">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index + 1}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    index + 1 === currentStep
                      ? "bg-primary w-5"
                      : index + 1 < currentStep
                        ? "bg-primary/50"
                        : "bg-muted",
                  )}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {!isFirstStep && onBack && (
                <Button onClick={onBack} variant="outline" className="flex-1">
                  Back
                </Button>
              )}
              {!isLastStep && onNext ? (
                <Button onClick={onNext} className="flex-1">
                  Next
                </Button>
              ) : isLoggedIn ? (
                <Button onClick={onComplete} className="flex-1">
                  Get Started
                </Button>
              ) : (
                <Button asChild className="flex-1">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
