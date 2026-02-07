"use client";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/posthog";
import { Button } from "@/lib/ui/data-display/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Input } from "@/lib/ui/forms/input";
import { Label } from "@/lib/ui/forms/label";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import logo from "@/public/logo.svg";

export function WaitlistForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Track waitlist signup in PostHog
      trackEvent.waitlistJoined({ email });

      setIsSubmitted(true);
      toast.success("You've been added to the waitlist! We'll notify you when signups open.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <Image
              src={logo}
              alt="Fiber"
              width={48}
              height={48}
              className="rounded flex-shrink-0"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">Join the Waitlist</CardTitle>
            <CardDescription className="text-base">
              {!isSubmitted
                ? "New signups are currently unavailable. Enter your email to be notified when we open up again."
                : "Thanks for joining! We'll be in touch soon."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#FFE033] hover:bg-[#FFD700] text-black"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Joining..." : "Join Waitlist"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✅ You&apos;re on the list! 🚀
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => (window.location.href = "/")}
              >
                Back to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
