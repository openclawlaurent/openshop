"use client";

import { useState, useEffect } from "react";
import { UserProfileCard } from "../ui";
import { UserProfile } from "../content/types";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import { TierBadge } from "@/lib/tiers/ui";
import { BoostTiersDrawer } from "@/lib/tiers/feature";
import { useBoostTiers } from "@/lib/tiers/data-access";

export interface UserProfileCardContainerProps {
  profile: UserProfile | null;
}

export function UserProfileCardContainer({ profile }: UserProfileCardContainerProps) {
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(profile?.avatar_url);
  const [boostTierDrawerOpen, setBoostTierDrawerOpen] = useState(false);
  const [payoutTokenLabel, setPayoutTokenLabel] = useState<string>("Token");
  const { refetch } = useUserProfileContext();
  const { boostTiers } = useBoostTiers();

  // Fetch payout token label when profile is loaded
  useEffect(() => {
    if (!profile?.payout_partner_token_id) return;

    const fetchTokenLabel = async () => {
      try {
        const response = await fetch("/api/partner-tokens");
        if (response.ok) {
          const tokens = await response.json();
          const token = tokens.find(
            (t: { id: string; display_label: string }) => t.id === profile.payout_partner_token_id,
          );
          if (token) {
            setPayoutTokenLabel(token.display_label);
          }
        }
      } catch (error) {
        console.error("Error fetching token label:", error);
      }
    };

    fetchTokenLabel();
  }, [profile?.payout_partner_token_id]);

  if (!profile) {
    return (
      <UserProfileCard
        profile={null}
        onRefetch={refetch}
        currentAvatarUrl={null}
        setCurrentAvatarUrl={() => {}}
        memberSince=""
      />
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const currentTier = boostTiers.find((t) => t.id === profile.boost_tier_id);

  return (
    <>
      <UserProfileCard
        profile={profile}
        onRefetch={refetch}
        currentAvatarUrl={currentAvatarUrl}
        setCurrentAvatarUrl={setCurrentAvatarUrl}
        memberSince={memberSince}
      >
        {/* Boost Tier */}
        {profile.boost_tier_id && boostTiers.length > 0 && currentTier && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Boost Tier</p>
              <div className="mt-1">
                <TierBadge
                  tierName={currentTier.name}
                  onClick={() => setBoostTierDrawerOpen(true)}
                  payoutTokenBoost={currentTier.payout_token_boost_multiplier}
                  platformTokenBoost={currentTier.platform_token_boost_multiplier}
                  payoutTokenLabel={payoutTokenLabel}
                  showMultipliers={true}
                />
              </div>
            </div>
          </div>
        )}
      </UserProfileCard>

      {/* Boost Tiers Drawer */}
      {profile.boost_tier_id && (
        <BoostTiersDrawer
          open={boostTierDrawerOpen}
          onOpenChange={setBoostTierDrawerOpen}
          boostTiers={boostTiers}
          currentTierId={profile.boost_tier_id}
          userAvatarUrl={currentAvatarUrl}
        />
      )}
    </>
  );
}
