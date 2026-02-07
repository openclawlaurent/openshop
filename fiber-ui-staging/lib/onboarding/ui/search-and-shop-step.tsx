import { ChevronRight } from "lucide-react";
import { OnboardingStepCard } from "./onboarding-step-card";
import { FeatureIcon } from "./feature-icon";
import { ONBOARDING_CONTENT } from "../content";

const content = ONBOARDING_CONTENT.howItWorks;

/**
 * Step 2: How it works
 */
export function HowItWorksStep() {
  return (
    <OnboardingStepCard
      title={content.title}
      description={content.description}
      imageSrc={content.imagePath}
      imageAlt={content.imageAlt}
    >
      <div className="flex items-center justify-center w-full">
        {content.features?.map((feature, index) => (
          <div key={feature.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 w-20">
              <div className="p-2 rounded-full bg-primary/10">
                <FeatureIcon icon={feature.icon} color={feature.color} size="sm" />
              </div>
              <p className="text-xs font-medium text-center">{feature.label}</p>
            </div>
            {index < (content.features?.length ?? 0) - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </OnboardingStepCard>
  );
}
