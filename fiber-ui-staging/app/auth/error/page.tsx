import Link from "next/link";
import { Button } from "@/lib/ui/data-display/button";

export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">
          There was an error during authentication. Please try again.
        </p>
        <Button asChild>
          <Link href="/auth/login">Return to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
