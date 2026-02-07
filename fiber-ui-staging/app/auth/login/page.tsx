import { LoginForm } from "@/lib/auth/feature";
import { redirect } from "next/navigation";

export default function Login() {
  // Check if signups are disabled via environment variable
  const signupsDisabled = process.env.NEXT_PUBLIC_SIGNUPS_DISABLED === "true";

  if (signupsDisabled) {
    redirect("/waitlist");
  }

  return <LoginForm />;
}
