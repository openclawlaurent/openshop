import { FaqList } from "@/lib/faq/ui";
import { faqItems } from "@/lib/faq/content";

/**
 * FAQ page feature component
 * Orchestrates FAQ content and UI
 */
export function FaqPage() {
  return <FaqList items={faqItems} />;
}
