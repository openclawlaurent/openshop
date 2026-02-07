import { UserProfileCardContainer } from "./user-profile-card-container";
import { getUserProfile } from "../data-access/server";
import { WalletConnection } from "@/lib/wallet/feature";
import { PayoutSettings } from "../ui";
import { LogoutButton } from "@/lib/ui/layout/logout-button";
import { ensureUserProfile } from "@/lib/actions/server/user-profile";
import { getPartnerTokens } from "@/lib/data/partner-tokens";

export async function ProfilePageContent() {
  // Ensure user profile exists first
  await ensureUserProfile();

  const profile = await getUserProfile();
  const partnerTokens = await getPartnerTokens();

  // Auth is now handled by ProtectedPageWrapper, so we can assume user/profile exists

  return (
    <div className="w-full max-w-6xl mx-auto md:p-5">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="profile-heading">
            Profile
          </h1>
          <p className="text-muted-foreground">Manage your account and payout settings</p>
        </div>
        <LogoutButton />
      </div>

      <div className="space-y-6">
        <UserProfileCardContainer profile={profile} />

        <div className="grid gap-6 md:grid-cols-2">
          <PayoutSettings initialPartnerTokens={partnerTokens} />
          <WalletConnection />
        </div>
      </div>
    </div>
  );
}
