import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { FaqItemComponent } from "./faq-item";
import { type FaqItem } from "../content";

interface FaqListProps {
  items: FaqItem[];
}

/**
 * FAQ list component
 * Displays a collection of FAQ items in a card layout
 */
export function FaqList({ items }: FaqListProps) {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">
          Everything you need to know about earning tokens with Fiber
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Questions</CardTitle>
          <CardDescription>
            Find answers to the most frequently asked questions about our affiliate platform and
            earning tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {items.map((item, index) => (
              <FaqItemComponent key={item.id} item={item} isLast={index === items.length - 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
