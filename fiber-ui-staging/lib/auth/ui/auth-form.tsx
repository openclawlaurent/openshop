"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { trackEvent, analytics } from "@/lib/analytics/posthog";
import { triggerUserSignup } from "@/lib/api/events";
import { signInWithGoogle, signInWithTwitter } from "@/lib/auth/social-providers";
// eslint-disable-next-line import/no-restricted-paths -- TODO: Move feature flag logic to feature layer
import { useFeatureFlag } from "@/lib/analytics/data-access";
import { decodeEmailParam } from "@/lib/utils/url-params";
import { Button } from "@/lib/ui/data-display/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Input } from "@/lib/ui/forms/input";
import { Label } from "@/lib/ui/forms/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/lib/ui/forms/input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import logo from "@/public/logo.svg";

const oauthProviders = {
  google: signInWithGoogle,
  twitter: signInWithTwitter,
} as const;

type OAuthProvider = keyof typeof oauthProviders;

export function AuthForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  // Decode masked email from "h" parameter
  const maskedEmail = searchParams.get("h");
  const emailFromUrl = maskedEmail ? decodeEmailParam(maskedEmail) : "";

  const { isEnabled: socialAuthEnabled } = useFeatureFlag("login-social-auth", false);
  console.log({ socialAuthEnabled });

  // Disable X (Twitter) login in all environments except production
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
  const isXDisabled = !isProduction;

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [lastProvider, setLastProvider] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // Don't include emailRedirectTo to avoid magic links
        },
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Check your email for the 6-digit verification code!");
    } catch (error: unknown) {
      // Check for signup disabled error
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "signup_disabled"
      ) {
        toast.error(
          "New signups are currently unavailable. Join our waitlist to be notified when we reopen.",
          {
            action: {
              label: "Join waitlist",
              onClick: () => router.push("/waitlist"),
            },
            actionButtonStyle: {
              backgroundColor: "#FFE033",
              color: "#000",
              fontWeight: "600",
            },
          },
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch last login provider hint and email for this user
  useEffect(() => {
    if (emailFromUrl) {
      const fetchLastProvider = async () => {
        try {
          const response = await fetch(
            `/api/user/last-provider?email=${encodeURIComponent(emailFromUrl)}`,
          );
          if (response.ok) {
            const data = await response.json();
            // Set OAuth provider hint (google/twitter) - null if they used email/OTP
            setLastProvider(data.provider || null);
            // Pre-fill email field from API response
            if (data.email) {
              setEmail(data.email);
            }
          }
        } catch (error) {
          console.error("Failed to fetch last provider:", error);
        }
      };
      fetchLastProvider();
    }
  }, [emailFromUrl]);

  // Auto-send OTP if email is provided in URL
  useEffect(() => {
    if (emailFromUrl && !otpSent && !isLoading) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSendOTP(fakeEvent);
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromUrl]);

  const handleVerifyOTP = async (e?: React.FormEvent, otpValue?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = otpValue || otp;
    if (codeToVerify.length !== 6) return;

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token: codeToVerify,
        type: "email",
      });
      if (error) throw error;

      // Ensure user profile is created immediately after successful auth
      // The API will tell us if this is a new user based on whether the profile already existed
      let isNewUser = false;
      if (data?.user) {
        const response = await fetch("/api/user/ensure-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          console.error("Failed to ensure user profile");
        } else {
          const profileData = await response.json();
          isNewUser = profileData.isNewUser === true;
        }
      }

      toast.success("Successfully verified!");

      // Identify user in PostHog
      analytics.identify(data?.user?.id || "", {
        email: data?.user?.email,
      });

      // Track event based on whether this is a new user or returning user
      if (isNewUser) {
        trackEvent.userSignedUp({
          user_id: data?.user?.id,
          email: data?.user?.email,
        });

        // Trigger welcome email (fire and forget - doesn't block the flow)
        if (data?.user?.email && data?.user?.id) {
          triggerUserSignup({
            email: data.user.email,
            userId: data.user.id,
            userName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          }).catch((error) => {
            console.error("Failed to trigger welcome email:", error);
            // Don't show error to user - this is a background operation
          });
        }
      } else {
        trackEvent.userSignedIn({
          user_id: data?.user?.id,
          email: data?.user?.email,
        });
      }

      // Small delay to ensure profile is ready
      setTimeout(() => {
        router.push(redirectTo);
      }, 100);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid verification code";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setIsLoading(true);

    try {
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      const { data, error } = await oauthProviders[provider](callbackUrl);

      if (error) throw error;

      // Redirect to OAuth provider's consent screen if URL is present
      if (data?.url) {
        window.location.href = data.url;
        return; // Don't set loading to false as we're redirecting
      } else {
        throw new Error("No redirect URL returned from OAuth provider");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      console.error("[OAUTH] Login error:", errorMessage);
      toast.error(errorMessage);
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
            <CardTitle className="text-3xl font-bold">
              Shop at 50,000 retailers. Earn your favorite Solana token
            </CardTitle>
            <CardDescription className="text-base">
              {!otpSent
                ? "Sign in or register to continue"
                : "Enter the verification code sent to your email"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {!otpSent ? (
              <form onSubmit={handleSendOTP}>
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
                    {lastProvider && emailFromUrl && (
                      <p className="text-sm text-muted-foreground">
                        Previously used{" "}
                        {lastProvider === "google"
                          ? "Google"
                          : lastProvider === "twitter"
                            ? "Twitter"
                            : lastProvider}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#FFE033] hover:bg-[#FFD700] text-black"
                    disabled={isLoading}
                    size={"lg"}
                  >
                    Start earning
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    By continuing, you agree to our{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted h-12 text-base"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        disabled={isLoading}
                        autoFocus
                        autoComplete="off"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(value) => {
                          setOtp(value);
                          if (value.length === 6 && !isLoading) {
                            handleVerifyOTP(undefined, value);
                          }
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={1} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={2} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={3} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={4} className="h-14 w-14 text-lg" />
                          <InputOTPSlot index={5} className="h-14 w-14 text-lg" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                    size="lg"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                  >
                    Back
                  </Button>
                </div>
              </form>
            )}

            {socialAuthEnabled && (
              <>
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 border-t border-muted" />
                  <span className="text-xs uppercase text-muted-foreground/60">OR</span>
                  <div className="flex-1 border-t border-muted" />
                </div>

                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleOAuthLogin("google")}
                    type="button"
                    disabled={isLoading}
                    size="lg"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleOAuthLogin("twitter")}
                      type="button"
                      disabled={isLoading || isXDisabled}
                      size="lg"
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Continue with X
                    </Button>
                    {isXDisabled && (
                      <div className="mt-2 text-xs text-muted-foreground text-center">
                        X login is only available in production
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
