"use client";

import { useEffect, useState, memo } from "react";
import { Offer } from "@/app/api/offers/route";
import { UserProfile } from "@/lib/profile/content";
import { PartnerToken } from "@/lib/data/partner-tokens";
import { SearchDialogContainer } from "@/lib/search/feature";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import { OffersList } from "@/lib/offers/feature";

interface HomePageProps {
  initialOffers: Offer[];
  userProfile: UserProfile | null;
  partnerTokens: PartnerToken[];
  initialSearchQuery?: string;
}

// Separate component for animated currency display to prevent unnecessary re-renders
const AnimatedCurrency = memo(
  ({ cryptoOptions }: { cryptoOptions: Array<{ name: string; color: string }> }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % cryptoOptions.length);
          setIsAnimating(false);
        }, 300);
      }, 2000); // Change every 2 seconds
      return () => clearInterval(interval);
    }, [cryptoOptions.length]);

    const getAnimationClasses = () => {
      return `transition-all duration-300 ${
        isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`;
    };

    // Guard against empty array
    if (cryptoOptions.length === 0) {
      return <span>crypto</span>;
    }

    return (
      <span
        className={`${getAnimationClasses()}`}
        style={{
          color: cryptoOptions[currentIndex]?.color || "text-gray-400",
          minWidth: "65px",
          display: "inline-block",
          textAlign: "center",
          textShadow: isAnimating ? "none" : "0 0 18px currentColor",
        }}
      >
        {cryptoOptions[currentIndex]?.name || "crypto"}
      </span>
    );
  },
);

AnimatedCurrency.displayName = "AnimatedCurrency";

export function HomePage({
  initialOffers,
  userProfile,
  partnerTokens,
  initialSearchQuery,
}: HomePageProps) {
  // Don't use state here - just use the prop directly since it comes from server
  const offers = initialOffers;
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Use real-time profile from context for setup banner
  // Falls back to server-side prop if context is not available
  const { profile: contextProfile } = useUserProfileContext();

  // Transform partner tokens into display format with colors from database
  // Fallback to default options if partner tokens are empty
  const cryptoOptions = partnerTokens.map((token) => ({
    name: `${token.display_label}`,
    color: token.brand_color || "#6B7280", // Default gray color if null
  }));

  // Check if setup is incomplete using real-time profile from context
  // Context profile has the latest data for setup banner
  const setupProfile = contextProfile || userProfile;
  const hasIncompleteSetup =
    setupProfile &&
    (!setupProfile.is_solana_wallet_connected || !setupProfile.payout_partner_token_id);

  return (
    <div className="w-full max-w-6xl mx-auto md:p-5" data-testid="home-page">
      <div className="text-center my-5 md:my-5">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Shop Smarter. Flex Harder.</h1>
        <p className="text-muted-foreground mb-4 h4">
          Turn everyday purchases into <AnimatedCurrency cryptoOptions={cryptoOptions} />
        </p>
      </div>

      <OffersList
        initialOffers={offers}
        showSearch={true}
        loading={false}
        source="homepage"
        userProfile={userProfile}
        initialSearchQuery={initialSearchQuery}
        onMobileSearchClick={() => setSearchDialogOpen(true)}
        showSetupBanner={hasIncompleteSetup}
        setupProfile={setupProfile}
      />

      {/* Search Dialog for mobile */}
      <SearchDialogContainer open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
    </div>
  );
}
