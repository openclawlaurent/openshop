import { PrivacyContent } from "@/lib/privacy/ui";
import { lastUpdated, privacySections } from "@/lib/privacy/content";

/**
 * Privacy Policy page feature component
 * Orchestrates privacy content and UI
 */
export function PrivacyPage() {
  return <PrivacyContent lastUpdated={lastUpdated} sections={privacySections} />;
}
