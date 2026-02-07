import { type FaqItem } from "../content";

interface FaqItemProps {
  item: FaqItem;
  isLast?: boolean;
}

/**
 * Individual FAQ item component
 * Displays a single question and answer pair
 */
export function FaqItemComponent({ item, isLast = false }: FaqItemProps) {
  return (
    <div className={`border-b border-border pb-6 ${isLast ? "last:border-b-0 last:pb-0" : ""}`}>
      <h3 className="text-lg font-semibold mb-3">{item.question}</h3>
      <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
    </div>
  );
}
