/**
 * API client for triggering events (signup, etc.)
 * Calls Next.js API routes which proxy to the backend API
 */

export interface UserSignupData {
  email: string;
  userName?: string;
  userId?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

/**
 * Trigger user signup event
 * Sends a welcome email and can trigger other onboarding actions
 *
 * Features:
 * - Email deduplication (won't send duplicate welcome emails)
 * - Async processing (doesn't block signup flow)
 * - Error handling (failures don't affect signup)
 *
 * @param userData - User signup data
 * @returns Promise with API response or undefined if failed
 */
export const triggerUserSignup = async (
  userData: UserSignupData,
): Promise<ApiResponse | undefined> => {
  try {
    const response = await fetch("/api/events/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to trigger signup event:", response.status, data);
      // Still return the data - the API route returns 202 even on backend failure
    }

    return data;
  } catch (error) {
    console.error("Error triggering signup event:", error);
    // Don't throw - we don't want to fail user signup if email fails
    return undefined;
  }
};
