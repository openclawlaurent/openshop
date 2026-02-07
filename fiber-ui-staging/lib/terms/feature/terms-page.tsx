import { TermsContent } from "@/lib/terms/ui";
import { termsHtml } from "@/lib/terms/content";

/**
 * Terms of Service page feature component
 * Orchestrates terms content and UI
 */
export function TermsPage() {
  return <TermsContent html={termsHtml} />;
}
