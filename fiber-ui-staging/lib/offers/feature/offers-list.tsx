"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchCommandContainer } from "@/lib/search/feature";
import { OfferCard } from "@/lib/offers/feature";
import { OfferCardSkeleton, OffersFilters } from "@/lib/offers/ui";
import { useAuth } from "@/contexts/auth-context";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import { getOffers, Offer } from "@/lib/offers/data-access";
import { UserProfile } from "@/lib/profile/content";
import { Card, CardContent } from "@/lib/ui/layout/card";
import { Check, AlertCircle, Wallet, Coins, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { UserProfileData } from "@/lib/data/user-profile-client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/ui/layout/collapsible";
import { getMerchantSortOptions } from "@/lib/services/merchant-filters-client";

interface OffersListProps {
  initialOffers: Offer[];
  showSearch?: boolean;
  showFilters?: boolean;
  loading?: boolean;
  source?: string; // Track where offers came from
  userProfile?: UserProfile | null; // Accept profile as prop for SSR scenarios
  initialSearchQuery?: string; // The search query used to fetch initialOffers
  onMobileSearchClick?: () => void; // Callback to open mobile search dialog
  showSetupBanner?: boolean | null; // Whether to show incomplete setup banner
  setupProfile?: UserProfile | UserProfileData | null; // Profile data for setup banner
}

export function OffersList({
  initialOffers,
  showSearch = true,
  showFilters = true,
  loading: externalLoading = false,
  source = "unknown",
  userProfile,
  initialSearchQuery,
  onMobileSearchClick,
  showSetupBanner = false,
  setupProfile,
}: OffersListProps) {
  const { user, loading: authLoading } = useAuth();
  const contextProfile = useUserProfileContext();
  const router = useRouter();
  // Use prop profile if provided (SSR), otherwise fallback to context
  const profile = userProfile || contextProfile?.profile;
  const searchParams = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string | undefined>(undefined);
  const [setupBannerOpen, setSetupBannerOpen] = useState(false);

  // Sync internal offers state when initialOffers prop changes
  useEffect(() => {
    setOffers(initialOffers);
  }, [initialOffers]);

  const handleSearch = useCallback(
    async (query: string) => {
      // If empty query and we haven't searched yet, keep initial offers
      if (!query.trim() && !hasSearched) {
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        // Fetch offers based on search query
        const newOffers = await getOffers(query.trim());
        setOffers(newOffers);
      } catch (error) {
        console.error("Error fetching offers:", error);
        // On error, keep existing offers
      } finally {
        setLoading(false);
      }
    },
    [hasSearched],
  );

  // Check if there's an initial search query from URL
  useEffect(() => {
    const queryParam = searchParams.get("q");
    const categoryParam = searchParams.get("category");
    const sortParam = searchParams.get("sort");

    // Update local state from URL params
    if (categoryParam) setSelectedCategory(categoryParam);
    if (sortParam) {
      setSelectedSort(sortParam);
    } else if (selectedSort === undefined) {
      // No sort in URL and no sort selected yet - set default
      getMerchantSortOptions().then((sortOptions) => {
        if (sortOptions.length > 0) {
          setSelectedSort(sortOptions[0].slug);
        }
      });
    }

    // If the query param matches what was already used for SSR, don't refetch
    if (queryParam?.trim() === initialSearchQuery?.trim()) {
      // The SSR data already matches the query, no need to refetch
      return;
    }

    // If query changed, we need to fetch new data
    if (queryParam !== null && queryParam !== initialSearchQuery) {
      setHasSearched(true);
      handleSearch(queryParam);
    }
  }, [searchParams, handleSearch, initialSearchQuery, selectedSort]);

  // Handle category filter change
  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      const params = new URLSearchParams(searchParams.toString());

      if (category === "all") {
        params.delete("category");
      } else {
        params.set("category", category);
      }

      router.push(`/?${params.toString()}`);
      router.refresh();
    },
    [router, searchParams],
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (sort: string) => {
      setSelectedSort(sort);
      const params = new URLSearchParams(searchParams.toString());

      // Always set the sort parameter to ensure it's in the URL
      params.set("sort", sort);

      router.push(`/?${params.toString()}`);
      router.refresh();
    },
    [router, searchParams],
  );

  // Remove constant logging to prevent spam

  return (
    <div className="w-full space-y-6">
      {showSearch && (
        <div className="flex justify-center">
          <SearchCommandContainer
            placeholder="Search offers..."
            onMobileClick={onMobileSearchClick}
          />
        </div>
      )}

      {showSetupBanner && setupProfile && (
        <>
          {/* Mobile: Collapsible accordion */}
          <div className="md:hidden mb-6" data-testid="incomplete-setup-banner">
            <Collapsible open={setupBannerOpen} onOpenChange={setSetupBannerOpen}>
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-2 text-yellow-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-semibold text-left">
                        Complete setup to start earning tokens
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        setupBannerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="space-y-3">
                    {/* Wallet Connection Step */}
                    {setupProfile.is_solana_wallet_connected ? (
                      <Card
                        className="bg-background border opacity-60 transition-all duration-200"
                        data-testid="wallet-setup-completed"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground">
                              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <Wallet className="w-5 h-5" />
                            <div>
                              <h4 className="font-medium">Connect Solana Wallet</h4>
                              <p className="text-sm text-muted-foreground">
                                Required to receive tokens
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Link href="/profile" data-testid="wallet-setup-incomplete">
                        <Card className="bg-background border cursor-pointer hover:bg-muted/50 transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground"></div>
                              <Wallet className="w-5 h-5" />
                              <div>
                                <h4 className="font-medium">Connect Solana Wallet</h4>
                                <p className="text-sm text-muted-foreground">
                                  Required to receive tokens
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )}

                    {/* Payout Currency Step */}
                    {setupProfile.payout_partner_token_id ? (
                      <Card
                        className="bg-background border opacity-60 transition-all duration-200"
                        data-testid="currency-setup-completed"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground">
                              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <Coins className="w-5 h-5" />
                            <div>
                              <h4 className="font-medium">Choose Token</h4>
                              <p className="text-sm text-muted-foreground">
                                Select your payout token
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Link href="/profile" data-testid="currency-setup-incomplete">
                        <Card className="bg-background border cursor-pointer hover:bg-muted/50 transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground"></div>
                              <Coins className="w-5 h-5" />
                              <div>
                                <h4 className="font-medium">Choose Token</h4>
                                <p className="text-sm text-muted-foreground">
                                  Select your payout token
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* Desktop: Full banner */}
          <div
            className="hidden md:block mb-6 p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/30"
            data-testid="incomplete-setup-banner-desktop"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-semibold">Complete setup to start earning tokens</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Wallet Connection Step */}
                {setupProfile.is_solana_wallet_connected ? (
                  <Card
                    className="bg-background border opacity-60 transition-all duration-200"
                    data-testid="wallet-setup-completed"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <Wallet className="w-5 h-5" />
                        <div>
                          <h4 className="font-medium">Connect Solana Wallet</h4>
                          <p className="text-sm text-muted-foreground">
                            Required to receive tokens
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Link href="/profile" data-testid="wallet-setup-incomplete">
                    <Card className="bg-background border cursor-pointer hover:bg-muted/50 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground"></div>
                          <Wallet className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium">Connect Solana Wallet</h4>
                            <p className="text-sm text-muted-foreground">
                              Required to receive tokens
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {/* Payout Currency Step */}
                {setupProfile.payout_partner_token_id ? (
                  <Card
                    className="bg-background border opacity-60 transition-all duration-200"
                    data-testid="currency-setup-completed"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <Coins className="w-5 h-5" />
                        <div>
                          <h4 className="font-medium">Choose Token</h4>
                          <p className="text-sm text-muted-foreground">Select your payout token</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Link href="/profile" data-testid="currency-setup-incomplete">
                    <Card className="bg-background border cursor-pointer hover:bg-muted/50 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground"></div>
                          <Coins className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium">Choose Token</h4>
                            <p className="text-sm text-muted-foreground">
                              Select your payout token
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showFilters && (
        <OffersFilters
          selectedCategory={selectedCategory}
          selectedSort={selectedSort}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading || externalLoading || authLoading ? (
          // Show 6 skeleton cards while loading
          Array.from({ length: 6 }).map((_, i) => <OfferCardSkeleton key={`skeleton-${i}`} />)
        ) : offers.length > 0 ? (
          offers.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              user={user}
              profile={profile}
              source={source}
              position={index + 1} // 1-based position for Algolia tracking
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No results found.
          </div>
        )}
      </div>
    </div>
  );
}
