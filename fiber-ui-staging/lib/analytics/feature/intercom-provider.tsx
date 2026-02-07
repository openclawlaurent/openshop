"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Intercom as IntercomMessenger } from "@intercom/messenger-js-sdk";

export function IntercomProvider() {
  const { user } = useAuth();

  useEffect(() => {
    // Get Intercom App ID from environment variable
    const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

    if (!appId) {
      console.warn("Intercom App ID is not configured");
      return;
    }

    // Initialize Intercom with hidden launcher (tours can still auto-show)
    IntercomMessenger({
      app_id: appId,
      user_id: user?.id,
      email: user?.email,
      created_at: user?.created_at ? new Date(user.created_at).getTime() / 1000 : undefined,
      hide_default_launcher: true,
    });

    // Update Intercom when user changes
    if (user) {
      window.Intercom?.("update", {
        user_id: user.id,
        email: user.email,
        created_at: user.created_at ? new Date(user.created_at).getTime() / 1000 : undefined,
        hide_default_launcher: true,
      });
    }

    // Cleanup on unmount
    return () => {
      window.Intercom?.("shutdown");
    };
  }, [user]);

  return null;
}

/**
 * Helper function to open Intercom chat widget
 * Call this from anywhere in your app to show the chat
 */
export function openIntercom() {
  if (typeof window !== "undefined" && window.Intercom) {
    window.Intercom("show");
  } else {
    console.warn("Intercom is not initialized");
  }
}

/**
 * Track tour completion
 * Call this when user completes the onboarding tour
 */
export function trackTourCompletion(tourId: number) {
  if (typeof window !== "undefined" && window.Intercom) {
    window.Intercom("trackEvent", "completed-product-tour", {
      tour_id: tourId,
      completed_at: new Date().toISOString(),
    });
  }
}
