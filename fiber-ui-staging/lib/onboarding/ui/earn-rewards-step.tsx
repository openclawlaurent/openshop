import { OnboardingStepCard } from "./onboarding-step-card";
import { FeatureIcon } from "./feature-icon";
import { ONBOARDING_CONTENT } from "../content";

const content = ONBOARDING_CONTENT.welcome;

/**
 * Step 1: Welcome to Fiber
 */
export function WelcomeStep() {
  return (
    <OnboardingStepCard
      title={content.title}
      description={content.description}
      imageSrc={content.imagePath}
      imageAlt={content.imageAlt}
    >
      <div className="flex items-center justify-center gap-4 w-full">
        {content.features?.map((feature) => (
          <div
            key={feature.label}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30"
          >
            <FeatureIcon icon={feature.icon} color={feature.color} size="sm" />
            <span className="text-sm font-medium">{feature.label}</span>
          </div>
        ))}
      </div>
    </OnboardingStepCard>
  );
}
