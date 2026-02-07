import { Metadata } from "next";
import { TermsPage } from "@/lib/terms/feature";

export const metadata: Metadata = {
  title: "Terms of Service - Fiber",
  description: "Terms of Service for Fiber's affiliate commerce platform",
};

export default function TermsPageRoute() {
  return <TermsPage />;
}
