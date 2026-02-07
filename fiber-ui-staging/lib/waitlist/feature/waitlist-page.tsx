"use client";

import { Suspense } from "react";
import { Skeleton } from "@/lib/ui/feedback/skeleton";
import { WaitlistForm } from "../ui";

function WaitlistPageContent() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <WaitlistForm />
      </div>
    </div>
  );
}

export function WaitlistPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-lg">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      }
    >
      <WaitlistPageContent />
    </Suspense>
  );
}
