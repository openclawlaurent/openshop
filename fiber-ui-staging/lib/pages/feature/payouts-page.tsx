import { WalletConnection } from "@/lib/wallet/feature";
import { PayoutSettings } from "@/lib/profile/ui";
import { ensureUserProfile } from "@/lib/actions/server/user-profile";
import { getPartnerTokens } from "@/lib/data/partner-tokens";

export async function PayoutsPageContent() {
  // Ensure user profile exists first
  await ensureUserProfile();

  // Fetch partner tokens on server side
  const partnerTokens = await getPartnerTokens();

  return (
    <div className="w-full max-w-6xl mx-auto md:p-5" data-testid="payouts-page">
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Payouts</h1>
          <p className="text-muted-foreground">Connect your wallet and configure your token</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WalletConnection />
        <PayoutSettings initialPartnerTokens={partnerTokens} />
      </div>
    </div>
  );
}
