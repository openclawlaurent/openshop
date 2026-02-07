import { HomePage } from "@/lib/pages/feature/home-page";
import { getSearchResults } from "@/lib/search/data-access/server";
import { ensureUserProfile } from "@/lib/actions/server/user-profile";
import { getUserProfile } from "@/lib/profile/data-access/server";
import { getPartnerTokens } from "@/lib/data/partner-tokens";
import { getBoostTierById } from "@/lib/tiers/data-access/server";
import { calculateUserRateDetails } from "@/lib/utils/user-rate-calculator";

// Force dynamic rendering to ensure search params are always fresh
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  // Ensure user profile exists (creates one if logged in and doesn't have one)
  await ensureUserProfile();

  const userProfile = await getUserProfile();
  const partnerTokens = await getPartnerTokens();

  // Fetch user's boost tier
  const boostTier = userProfile?.boost_tier_id
    ? await getBoostTierById(userProfile.boost_tier_id)
    : null;

  // Find user's selected partner token
  const userPartnerToken = userProfile?.payout_partner_token_id
    ? partnerTokens.find((token) => token.id === userProfile.payout_partner_token_id)
    : null;

  // Get offers based on search query, category, and sort parameters
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.q?.trim();
  const category = resolvedSearchParams.category;
  const sort = resolvedSearchParams.sort;
  const offersFromSSR = await getSearchResults(searchQuery, category, sort);

  // Add user-specific rate details to each offer
  const initialOffers = offersFromSSR.map((offer) => {
    if (userPartnerToken && boostTier) {
      const userRateDetails = calculateUserRateDetails(
        offer,
        userPartnerToken.display_label,
        boostTier,
      );
      return {
        ...offer,
        userRateDetails,
      };
    }
    return offer;
  });

  return (
    <HomePage
      initialOffers={initialOffers}
      userProfile={userProfile}
      partnerTokens={partnerTokens}
      initialSearchQuery={searchQuery}
    />
  );
}
