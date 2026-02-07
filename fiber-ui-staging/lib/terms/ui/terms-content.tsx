import { Card, CardContent } from "@/lib/ui/layout/card";
import type { ReactNode } from "react";

interface TermsContentProps {
  html: ReactNode;
}

/**
 * Terms of Service content component (pure UI)
 * Renders terms content
 */
export function TermsContent({ html }: TermsContentProps) {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardContent className="pt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 first:[&_h1]:mt-0 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground">
          {html}
        </CardContent>
      </Card>
    </div>
  );
}
