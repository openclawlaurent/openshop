import { cn } from "@/lib/utils";
import Image from "next/image";

interface OnboardingStepCardProps {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Simple card component for onboarding steps
 * Clean, minimal design inspired by Polymarket
 */
export function OnboardingStepCard({
  title,
  description,
  imageSrc,
  imageAlt = "",
  children,
  className,
}: OnboardingStepCardProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {/* Image - full width */}
      {imageSrc && (
        <div className="relative w-full h-40 bg-muted/30">
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" priority />
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {/* Title */}
        <h2 className="text-xl font-bold text-foreground">{title}</h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {/* Optional content (for interactive steps) */}
        {children && <div className="w-full mt-2">{children}</div>}
      </div>
    </div>
  );
}
