"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Offer } from "@/app/api/offers/route";
import type { User } from "@supabase/supabase-js";
import type { UserProfileData } from "@/lib/data/user-profile-client";
import { trackSearchResultClick } from "@/lib/services/algolia-insights";
import { trackEvent } from "@/lib/analytics/posthog";
import {
  generateAffiliateLink,
  canGenerateAffiliateLink,
} from "@/lib/utils/affiliate-link-generator";
import Image from "next/image";
import { ChevronRight, ExternalLink, TrendingUp, Share2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/lib/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/lib/ui/overlay/sheet";
import { Button } from "@/lib/ui/data-display/button";
import { BoostTiersDrawer } from "@/lib/tiers/feature";
import type { BoostTier } from "@/lib/tiers/data-access";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AuthDrawer } from "@/lib/auth/feature";

// Analytics tracking for merchant clicks
const trackMerchantClick = (offer: Offer, _source?: string, position?: number) => {
  // Track click with Algolia Insights for search result improvement
  if (offer.queryID && position !== undefined) {
    console.log("🔍 Attempting to track click:", {
      offerId: offer.id,
      offerTitle: offer.title,
      queryID: offer.queryID,
      position,
    });
    trackSearchResultClick(offer.id, offer.queryID, position);
  } else {
    console.warn("⚠️ Click not tracked - missing data:", {
      offerId: offer.id,
      offerTitle: offer.title,
      hasQueryID: !!offer.queryID,
      hasPosition: position !== undefined,
      queryID: offer.queryID || "missing",
      position: position || "missing",
    });
  }
};

interface OfferCardProps {
  offer: Offer;
  user: User | null;
  profile: UserProfileData | null;
  source?: string; // Track where this offer came from (algolia, moonwalk, etc.)
  position?: number; // Position in search results (1-based) for click tracking
}

export function OfferCard({ offer, user, profile, source, position }: OfferCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showAuthDrawer, setShowAuthDrawer] = useState(false);
  const [showBoostDrawer, setShowBoostDrawer] = useState(false);
  const [boostTiers, setBoostTiers] = useState<BoostTier[]>([]);

  // Derive sheet open state from URL parameter
  const showDetailDrawer = searchParams.get("offerId") === offer.id;

  // Fetch boost tiers when user is logged in
  useEffect(() => {
    if (user) {
      const supabase = createClient();

      // Fetch boost tiers directly (client-side)
      const fetchTiers = async () => {
        const { data, error } = await supabase
          .from("boost_tiers")
          .select("*")
          .eq("is_active", true)
          .order("minimum_platform_token_staked_amount", { ascending: true });

        if (error) {
          console.error("Error fetching boost tiers:", error);
          return;
        }

        // Sort by tier order
        const tierOrder = [
          "starter",
          "alpha",
          "bronze",
          "silver",
          "gold",
          "platinum",
          "carbon fiber black",
        ];

        const sortedTiers = (data || []).sort((a, b) => {
          const indexA = tierOrder.indexOf(a.id.toLowerCase());
          const indexB = tierOrder.indexOf(b.id.toLowerCase());
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setBoostTiers(sortedTiers);
      };

      fetchTiers();
    }
  }, [user]);

  // Check if setup is incomplete - user needs both wallet and payout token
  const hasIncompleteSetup =
    !user || !profile?.is_solana_wallet_connected || !profile?.payout_partner_token_id;

  // Generate affiliate link through our redirect proxy
  const generateOfferLink = () => {
    // Require both trackingId and deviceId to generate link
    if (!canGenerateAffiliateLink(offer.trackingId, profile?.wildfire_device_id ?? undefined)) {
      return undefined;
    }

    const destinationUrl = offer.sourceUrl || offer.merchantUrl || undefined;

    return generateAffiliateLink({
      provider: "wildfire",
      trackingId: offer.trackingId!,
      deviceId: profile!.wildfire_device_id!,
      destinationUrl,
    });
  };

  // Open offer detail sheet by adding offerId to URL
  const openSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("offerId", offer.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Close offer detail sheet by removing offerId from URL
  const closeSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("offerId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle share button click - copy current URL to clipboard
  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleClick = () => {
    // Track the click for analytics (including Algolia Insights)
    trackMerchantClick(offer, source, position);

    // Track offer card click in PostHog
    trackEvent.offerCardClicked({
      merchant_name: offer.merchantName || offer.title,
      offer_id: offer.id,
      position,
      source,
    });

    // Always show the detail drawer regardless of setup status
    // Users can view offer details even if not logged in or setup incomplete
    openSheet();
  };

  const handleVisitClick = (e: React.MouseEvent) => {
    // Check setup status and show auth drawer if incomplete
    if (hasIncompleteSetup) {
      // Prevent navigation and show auth drawer to complete setup
      e.preventDefault();
      setShowAuthDrawer(true);
    }
    // If setup is complete, allow the link to navigate normally
  };

  // Check if we can generate or have a valid href
  const offerLink = generateOfferLink();

  // No continue handler needed - drawer only shows when setup is incomplete

  return (
    <>
      <div
        onClick={handleClick}
        className="relative flex items-center bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer no-underline"
        data-testid={`offer-card-${offer.id}`}
      >
        <div className="relative h-16 w-16 flex-shrink-0 m-3 bg-white rounded-md p-2 overflow-hidden">
          {offer.image ? (
            <Image src={offer.image} alt={offer.title} fill className="object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-2xl text-muted-foreground/50">
                {offer.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {offer.merchantLogoUrl && (
            <div className="absolute -bottom-1 -left-1 h-5 w-5 rounded-sm overflow-hidden bg-white border border-border p-0.5">
              <Image
                src={offer.merchantLogoUrl}
                alt={offer.merchantName || "Merchant"}
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
        <div className="flex flex-1 items-center justify-between py-3 pr-3 pl-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h5 className="text-base font-semibold text-foreground truncate">{offer.title}</h5>
            {offer.merchantName && (
              <p className="text-xs text-muted-foreground truncate">{offer.merchantName}</p>
            )}
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate">
              {offer.userRateDetails
                ? offer.userRateDetails.rateType === "PERCENTAGE"
                  ? `Up to ${offer.userRateDetails.userPercentage.toFixed(2)}% back`
                  : `Up to $${offer.userRateDetails.userAmount?.toFixed(2)} back`
                : offer.rewardLabel}
            </p>
          </div>
        </div>

        {/* Chevron - Right side */}
        <ChevronRight className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
      </div>

      <AuthDrawer
        isOpen={showAuthDrawer}
        onClose={() => setShowAuthDrawer(false)}
        offerTitle={offer.title}
      />

      {/* Detailed Offer Drawer */}
      <Sheet
        open={showDetailDrawer}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[540px] flex flex-col"
          data-testid="offer-detail-drawer"
        >
          <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 bg-white rounded-md p-2 overflow-hidden">
                {offer.image ? (
                  <Image src={offer.image} alt={offer.title} fill className="object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-2xl text-muted-foreground/50">
                      {offer.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {offer.merchantLogoUrl && (
                  <div className="absolute -bottom-1 -left-1 h-5 w-5 rounded-sm overflow-hidden bg-white border border-border p-0.5">
                    <Image
                      src={offer.merchantLogoUrl}
                      alt={offer.merchantName || "Merchant"}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl">{offer.title}</SheetTitle>
                <SheetDescription className="mt-1">
                  {offer.merchantName ||
                    (offer.href ? new URL(offer.href).hostname : "Visit store")}
                </SheetDescription>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {offer.userRateDetails
                        ? offer.userRateDetails.rateType === "PERCENTAGE"
                          ? `Up to ${offer.userRateDetails.userPercentage.toFixed(2)}% back`
                          : `Up to $${offer.userRateDetails.userAmount?.toFixed(2)} back`
                        : offer.rewardLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Go to Site Section */}
            <div className="mt-4 space-y-2">
              {hasIncompleteSetup ? (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleVisitClick}
                    data-testid="visit-offer-button"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Shop Now
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Complete setup to start earning tokens
                  </p>
                </>
              ) : offerLink ? (
                <>
                  <Button asChild className="w-full" size="lg" data-testid="visit-offer-button">
                    <a
                      href={offerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        // Track offer click in PostHog
                        trackEvent.offerClicked({
                          merchant_name: offer.merchantName || offer.title,
                          offer_id: offer.id,
                          wild_link: offerLink,
                          source,
                        });
                        closeSheet();
                      }}
                      data-affiliate-link={offerLink}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Shop Now
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Tokens will be automatically tracked when you shop through this link
                  </p>
                </>
              ) : (
                <>
                  <Button className="w-full" size="lg" disabled>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Shop Now (Setup Required)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Complete setup to start earning tokens
                  </p>
                </>
              )}

              {/* Share Link Button */}
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleShare}
                data-testid="share-offer-button"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Help others discover this offer and earn tokens
              </p>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 mt-4">
            {/* Product Details Section - Only show if this is a product with details */}
            {(offer.price || offer.color || offer.size || offer.brand || offer.rating) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Product Details</h3>
                <div className="space-y-2">
                  {offer.price && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="text-sm font-medium">
                        {offer.priceFormatted || `$${offer.price.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {offer.brand && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Brand:</span>
                      <span className="text-sm font-medium">{offer.brand}</span>
                    </div>
                  )}
                  {offer.color && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Color:</span>
                      <span className="text-sm font-medium">{offer.color}</span>
                    </div>
                  )}
                  {offer.size && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Size:</span>
                      <span className="text-sm font-medium">{offer.size}</span>
                    </div>
                  )}
                  {offer.rating && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <span className="text-sm font-medium">
                        {offer.rating.toFixed(1)}/5
                        {offer.reviewCount && ` (${offer.reviewCount} reviews)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Rate Details - Show if available from API */}
            {(() => {
              if (!offer.userRateDetails) return null;

              const details = offer.userRateDetails;
              const isFlat = details.rateType === "FLAT";

              if (isFlat) {
                // FLAT RATE DISPLAY (NO LOGIC - ALL PRE-CALCULATED)
                const hasBoost =
                  details.partnerTokenBoostMultiplier > 1.0 ||
                  details.platformTokenBoostMultiplier > 1.0;

                return (
                  <div className="mb-4 space-y-3">
                    {/* Original unboosted amounts (greyed out if boosted) */}
                    <div
                      className={`p-3 rounded-lg border ${hasBoost ? "bg-muted/30 border-muted line-through opacity-60" : "bg-purple-500/10 border-purple-500/20"}`}
                    >
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          For up to ${details.userAmount?.toFixed(2)} back, you&apos;ll receive the
                          USD equivalent of:
                        </span>{" "}
                        ${details.partnerTokenAmount?.toFixed(2)} in {details.partnerTokenLabel} + $
                        {details.platformTokenAmount?.toFixed(2)} in FP
                      </p>
                    </div>

                    {/* Boosted amounts (if applicable) */}
                    {hasBoost && (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
                            🚀 Boosted 🚀
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-1">
                          {details.partnerTokenBoostMultiplier}x {details.partnerTokenLabel} boost +{" "}
                          {details.platformTokenBoostMultiplier}x FP boost
                        </p>
                        <p className="text-xs font-medium">
                          <span className="text-foreground">
                            For up to ${details.userAmount?.toFixed(2)} back, you&apos;ll receive
                            the USD equivalent of:
                          </span>{" "}
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            ${details.partnerTokenBoostedAmount?.toFixed(2)} in{" "}
                            {details.partnerTokenLabel}
                          </span>
                          {" + "}
                          <span className="text-pink-600 dark:text-pink-400 font-bold">
                            ${details.platformTokenBoostedAmount?.toFixed(2)} in FP
                          </span>
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBoostDrawer(true);
                          }}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-2 font-medium p-0 h-auto"
                        >
                          Earn more <ChevronRight className="inline h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              } else {
                // PERCENTAGE RATE DISPLAY (NO LOGIC - ALL PRE-CALCULATED)
                const hasBoost =
                  details.partnerTokenBoostMultiplier > 1.0 ||
                  details.platformTokenBoostMultiplier > 1.0;

                return (
                  <div className="mb-4 space-y-3">
                    {/* Original unboosted rate (greyed out if boosted) */}
                    <div
                      className={`p-3 rounded-lg border ${hasBoost ? "bg-muted/30 border-muted line-through opacity-60" : "bg-purple-500/10 border-purple-500/20"}`}
                    >
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          For {details.userPercentage.toFixed(2)}% back, you&apos;ll receive:
                        </span>{" "}
                        {details.partnerTokenPercentage}% in {details.partnerTokenLabel} +{" "}
                        {details.platformTokenPercentage}% in FP
                      </p>
                    </div>

                    {/* Boosted rate (if applicable) */}
                    {hasBoost && (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
                            🚀 Boosted 🚀
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-1">
                          {details.partnerTokenBoostMultiplier}x {details.partnerTokenLabel} boost +{" "}
                          {details.platformTokenBoostMultiplier}x FP boost
                        </p>
                        <p className="text-xs font-medium">
                          <span className="text-foreground">
                            For {details.userPercentage.toFixed(2)}% back, you&apos;ll receive:
                          </span>{" "}
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            {details.partnerTokenBoostedPercentage}% in {details.partnerTokenLabel}
                          </span>
                          {" + "}
                          <span className="text-pink-600 dark:text-pink-400 font-bold">
                            {details.platformTokenBoostedPercentage}% in FP
                          </span>
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBoostDrawer(true);
                          }}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-2 font-medium p-0 h-auto"
                        >
                          Earn more <ChevronRight className="inline h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              }
            })()}

            {/* Rates Section */}
            {offer.allRates && offer.allRates.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2">Token Earnings Available</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  You&apos;ll earn tokens when your purchase matches any of these categories:
                </p>
                <ul className="space-y-1 text-sm">
                  {offer.allRates?.map((rate, index) => {
                    // NO LOGIC - use pre-calculated amount from API
                    // The 'amount' field already has the fee deducted
                    const displayAmount = rate.amount;

                    return (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full flex-shrink-0 mt-1.5" />
                        <span className="flex-1">{rate.name}</span>
                        <span className="font-semibold text-foreground">
                          {rate.kind === "PERCENTAGE"
                            ? `${parseFloat(displayAmount).toFixed(2)}% back`
                            : rate.kind === "FLAT"
                              ? `$${parseFloat(displayAmount).toFixed(2)} back`
                              : `${displayAmount}% back`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Additional Info */}
            <div className="pb-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="how-it-works" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2">
                    <span className="text-sm font-medium">How it works</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>• Click &quot;Shop Now&quot; button above</p>
                        <p>• Complete your purchase as normal</p>
                        <p>• Your purchase will appear as pending within 2-48 hours</p>
                        <p>
                          • Tokens are sent to your wallet once merchant fully approves your order,
                          which typically takes up to a few months
                        </p>
                        <p>• Rates may vary based on product categories and promotions</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Boost Tiers Drawer */}
      <BoostTiersDrawer
        open={showBoostDrawer}
        onOpenChange={setShowBoostDrawer}
        boostTiers={boostTiers}
        currentTierId={profile?.boost_tier_id || ""}
        userAvatarUrl={profile?.avatar_url}
      />
    </>
  );
}
