import { Metadata } from "next";
import { FaqPage } from "@/lib/faq/feature";

export const metadata: Metadata = {
  title: "FAQ - Fiber",
  description: "Frequently asked questions about Fiber",
};

export default function FAQPageRoute() {
  return <FaqPage />;
}
