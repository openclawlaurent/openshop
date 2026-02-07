"use client";

import { Suspense } from "react";
import { Skeleton } from "@/lib/ui/feedback/skeleton";
import { AuthForm } from "../ui";

function LoginFormContent() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <AuthForm />
      </div>
    </div>
  );
}

export function LoginForm() {
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
      <LoginFormContent />
    </Suspense>
  );
}
