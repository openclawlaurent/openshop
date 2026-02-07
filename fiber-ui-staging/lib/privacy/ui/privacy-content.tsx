import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { type PrivacySection } from "../content";

interface PrivacyContentProps {
  lastUpdated: string;
  sections: PrivacySection[];
}

/**
 * Privacy Policy content component (pure UI)
 */
export function PrivacyContent({ lastUpdated, sections }: PrivacyContentProps) {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Matters</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
