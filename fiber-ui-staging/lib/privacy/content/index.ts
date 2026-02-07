/**
 * Privacy Policy content for the Fiber platform
 */

export interface PrivacySection {
  id: string;
  title: string;
  content: string;
}

export const lastUpdated = "January 2025";

export const privacySections: PrivacySection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content:
      "Fiber ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our affiliate commerce platform.",
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    content:
      "We collect information you provide directly, including your email address, connected Solana wallet address, and payout token preferences. We also automatically collect information about your device, browser, and how you interact with our platform, including affiliate link clicks and purchase tracking data.",
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    content:
      "We use your information to: provide and maintain our service, process token earnings, track affiliate purchases, communicate with you about your account, improve our platform, comply with legal obligations, and prevent fraud or abuse of our service.",
  },
  {
    id: "affiliate-tracking",
    title: "4. Affiliate Tracking and Cookies",
    content:
      "We use cookies and similar tracking technologies to monitor affiliate link clicks and attribute purchases to your account. This is essential for calculating your token earnings. You can control cookie preferences through your browser settings, but disabling tracking cookies will prevent us from crediting your token earnings.",
  },
  {
    id: "wallet-data",
    title: "5. Wallet and Blockchain Data",
    content:
      "Your connected Solana wallet address is stored to facilitate token payouts. Blockchain transactions are publicly visible on the Solana network. We never have access to your private keys or the ability to control your wallet.",
  },
  {
    id: "data-sharing",
    title: "6. Information Sharing and Disclosure",
    content:
      "We share limited information with our merchant partners and affiliate network (Wildfire) to track purchases and process earnings. We do not sell your personal information to third parties. We may disclose information when required by law or to protect our rights and safety.",
  },
  {
    id: "data-security",
    title: "7. Data Security",
    content:
      "We implement reasonable security measures to protect your information from unauthorized access, alteration, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security of your data.",
  },
  {
    id: "data-retention",
    title: "8. Data Retention",
    content:
      "We retain your account information and transaction history for as long as your account is active and for a reasonable period afterward to comply with legal obligations, resolve disputes, and maintain transaction records for tax purposes.",
  },
  {
    id: "your-rights",
    title: "9. Your Rights and Choices",
    content:
      "You may access, update, or delete your account information through your profile settings. You can opt out of promotional emails, though we may still send you service-related communications. You have the right to request a copy of your data or account deletion.",
  },
  {
    id: "children-privacy",
    title: "10. Children's Privacy",
    content:
      "Fiber is not intended for users under the age of 18. We do not knowingly collect information from children. If we become aware that we have collected information from a child, we will take steps to delete it.",
  },
  {
    id: "changes-policy",
    title: "11. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform. Continued use of Fiber after changes constitutes acceptance of the updated policy.",
  },
  {
    id: "contact",
    title: "12. Contact Us",
    content:
      "If you have questions about this Privacy Policy or how we handle your information, please contact us at privacy@fiber.com or through our support channels.",
  },
];
