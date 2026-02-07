import { Metadata } from "next";
import { PrivacyPage } from "@/lib/privacy/feature";

export const metadata: Metadata = {
  title: "Privacy Policy - Fiber",
  description: "Privacy Policy for Fiber's affiliate commerce platform",
};

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}
