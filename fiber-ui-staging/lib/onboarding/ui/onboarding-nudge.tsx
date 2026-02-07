"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingNudgeProps {
  onClick: () => void;
  className?: string;
}

/**
 * Full-width floating nudge bar that appears at the bottom of the screen
 * Shows when scrolling down, hides when scrolling up
 */
export function OnboardingNudge({ onClick, className }: OnboardingNudgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollTopRef = useRef(0);

  // Show nudge when scrolling down, hide when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const mainElement = document.querySelector("main");
      if (!mainElement) return;

      const scrollTop = mainElement.scrollTop;
      const lastScrollTop = lastScrollTopRef.current;

      // Show when scrolling down past 200px, hide when scrolling up
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        setIsVisible(true);
      } else if (scrollTop < lastScrollTop) {
        setIsVisible(false);
      }

      lastScrollTopRef.current = scrollTop;
    };

    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => mainElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "flex items-center justify-center gap-2 px-4 py-3",
        "bg-background/95 backdrop-blur-sm",
        "border-t border-border shadow-lg",
        "text-sm font-medium",
        "hover:bg-muted/80 transition-all duration-300",
        isVisible ? "translate-y-0" : "translate-y-full",
        className,
      )}
    >
      <Info className="w-4 h-4 text-primary" />
      <span>How it works</span>
    </button>
  );
}
