import { Coins, Sparkles, MousePointerClick, ShoppingBag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFeature } from "../content";

type IconName = OnboardingFeature["icon"];

interface FeatureIconProps {
  icon: IconName;
  color?: string;
  size?: "sm" | "md";
  className?: string;
}

const iconMap = {
  coins: Coins,
  sparkles: Sparkles,
  mousePointerClick: MousePointerClick,
  shoppingBag: ShoppingBag,
  clock: Clock,
} as const;

const colorMap: Record<string, string> = {
  primary: "text-primary",
  "purple-500": "text-purple-500",
};

/**
 * Renders an icon from the onboarding content
 */
export function FeatureIcon({ icon, color = "primary", size = "sm", className }: FeatureIconProps) {
  const IconComponent = iconMap[icon];
  const colorClass = colorMap[color] || `text-${color}`;
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return <IconComponent className={cn(sizeClass, colorClass, className)} />;
}
