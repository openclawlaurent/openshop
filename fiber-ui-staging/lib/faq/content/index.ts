/**
 * FAQ content for the Fiber platform
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "what-is-fiber",
    question: "What is Fiber and how does it work?",
    answer:
      "Fiber is an AI-powered affiliate commerce platform that helps you start earning tokens when shopping online. We partner with over 500 brands to offer exclusive token earning rates. Simply browse offers on our platform, click through to the merchant's website, and complete your purchase normally. Your token earnings are automatically tracked and paid out in your selected Solana payout token to your connected wallet.",
  },
  {
    id: "how-much-cashback",
    question: "How much can I earn and what are the typical rates?",
    answer:
      "Token earning rates vary by merchant and typically range from 0% to 10% of your purchase amount. Some special promotions may offer even higher rates. All earnings are paid in your selected Solana payout token. You can see the exact earning rate for each offer on our platform before making a purchase.",
  },
  {
    id: "how-are-rewards-paid",
    question: "How and when are my token earnings paid out?",
    answer:
      "Token earnings are paid in your selected Solana payout token to your connected Solana wallet. After you make a qualifying purchase, it typically takes 30-90 days for your earnings to be confirmed by the merchant (this is standard across affiliate programs). Once confirmed, your token earnings are automatically deposited to your wallet. You'll receive notifications throughout the process to track your earnings.",
  },
  {
    id: "wallet-requirement",
    question: "Do I need a crypto wallet to use Fiber?",
    answer:
      "Yes, you'll need a Solana wallet to receive your token earnings. We support popular wallets like Phantom, Solflare, and other Solana-compatible wallets. If you don't have a wallet yet, you can easily create one - it's free and takes just a few minutes. We provide guides to help you set up your first crypto wallet and get started earning tokens.",
  },
  {
    id: "affiliate-tracking",
    question: "How does affiliate link tracking work and is my data safe?",
    answer:
      "When you click on an offer through Fiber, we generate a unique affiliate link that tracks your purchase with the merchant. This allows us to confirm your token earning eligibility and calculate your earnings. We only collect necessary transaction data to process your earnings - we never see your payment information, personal details, or browsing history outside of Fiber. Your privacy and security are our top priorities.",
  },
  {
    id: "getting-started",
    question: "How do I get started earning tokens with Fiber?",
    answer:
      "Getting started is easy! First, create your free Fiber account and connect your Solana wallet. Browse our collection of 500+ brand offers to find deals from your favorite retailers. Click through to the merchant's website using our affiliate links, shop normally, and complete your purchase. Your token earnings will be tracked automatically and paid out in your selected Solana payout token once the purchase is confirmed. Start earning tokens on purchases you're already making!",
  },
  {
    id: "tracking-issues",
    question: "What can prevent my token earnings from tracking properly?",
    answer:
      "To ensure your token earnings are tracked correctly, please be aware of these common issues: Ad blockers, privacy extensions, and browser settings that block cookies can interfere with affiliate tracking. Additionally, cross-device shopping (clicking an offer on one device and completing the purchase on another) cannot be guaranteed to track properly. For the best results, click through our affiliate links and complete your purchase on the same device and browser session without ad blockers or privacy tools enabled. While we strive to track all eligible purchases, we cannot guarantee token earnings credit when tracking has been disrupted by these technical limitations.",
  },
  {
    id: "commission-calculation",
    question: "Why is my cashback amount lower than expected based on my total order?",
    answer:
      "Commissions are calculated on the order subtotal before taxes and shipping fees are added, not on your final total. For example, if your order subtotal is $100 but your final total is $121.28 after taxes and shipping, and you're earning 5% back, your token earnings would be $5 (5% of $100 subtotal) rather than $6.06 (5% of the $121.28 total). This is standard across all affiliate programs and ensures consistent earning calculations based on the actual product purchase amount.",
  },
];
