"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchDialog } from "../ui";
import { useSearchURLParams } from "../data-access";
import { getMerchantCategories } from "@/lib/services/merchant-filters-client";
import { searchViaAPI } from "@/lib/services/algolia-api-client";
import type { AlgoliaMerchantRecord } from "@/types/algolia";
import type { MerchantCategory } from "@/lib/services/merchant-filters-client";

interface SearchDialogContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Feature component that orchestrates SearchDialog with data loading
 * Manages search state and navigation
 */
export function SearchDialogContainer({
  open,
  onOpenChange,
  className,
}: SearchDialogContainerProps) {
  const router = useRouter();
  const searchParams = useSearchURLParams();
  const [searchValue, setSearchValue] = useState("");
  const [categories, setCategories] = useState<MerchantCategory[]>([]);
  const [topMerchants, setTopMerchants] = useState<AlgoliaMerchantRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, searchResponse] = await Promise.all([
          getMerchantCategories(),
          searchViaAPI("", { hitsPerPage: 100 }),
        ]);

        setCategories(cats);

        // Extract unique merchants logic (similar to SearchCommandContainer)
        const merchantMap = new Map<number, AlgoliaMerchantRecord>();

        searchResponse.hits.forEach((hit) => {
          if (hit.type === "product" && "wildfireMerchantId" in hit && "merchantName" in hit) {
            const merchantId = hit.wildfireMerchantId;
            if (merchantId && !merchantMap.has(merchantId)) {
              const maxRateAmount = hit.maxRateAmount || 0;
              const merchantRecord: AlgoliaMerchantRecord = {
                objectID: `merchant_${merchantId}`,
                type: "merchant",
                wildfireMerchantId: merchantId,
                merchantName: hit.merchantName,
                domain: hit.domain || "",
                maxRateAmount: maxRateAmount,
                maxRateType: hit.maxRateType || "percentage",
                merchantScore: hit.merchantScore || 0,
                isPriority: hit.isPriority,
                logoUrl: hit.merchantLogoUrl,
              };
              merchantMap.set(merchantId, merchantRecord);
            }
          }
        });

        const merchants = Array.from(merchantMap.values())
          .sort((a, b) => (b.merchantScore || 0) - (a.merchantScore || 0))
          .slice(0, 20);

        setTopMerchants(merchants);
      } catch (error) {
        console.error("Error loading search data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.query ? { q: searchParams.query } : {});
      if (query.trim()) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      router.push(`/?${params.toString()}`);
      router.refresh();
    },
    [router, searchParams],
  );

  const handleCategorySelect = useCallback(
    (categorySlug: string) => {
      const params = new URLSearchParams(searchParams.query ? { q: searchParams.query } : {});
      params.set("category", categorySlug);

      router.push(`/?${params.toString()}`);
      router.refresh();
    },
    [router, searchParams],
  );

  const handleMerchantSelect = useCallback(
    (merchantName: string) => {
      setSearchValue(merchantName);

      // Create new params for a fresh merchant search
      const params = new URLSearchParams();
      params.set("q", merchantName);

      router.push(`/?${params.toString()}`);
    },
    [router],
  );

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSearch={handleSearch}
      onCategorySelect={handleCategorySelect}
      onMerchantSelect={handleMerchantSelect}
      categories={categories}
      topMerchants={topMerchants}
      loading={loading}
      className={className}
    />
  );
}
