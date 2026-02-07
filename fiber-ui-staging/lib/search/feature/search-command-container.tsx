"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchCommand } from "../ui";
import { useSearchURLParams } from "../data-access";
import { getMerchantCategories } from "@/lib/services/merchant-filters-client";
import { searchViaAPI } from "@/lib/services/algolia-api-client";
import type { MerchantCategory } from "@/lib/services/merchant-filters-client";
import type { AlgoliaMerchantRecord } from "@/types/algolia";

interface SearchCommandContainerProps {
  placeholder?: string;
  className?: string;
  onMobileClick?: () => void;
}

/**
 * Feature component that orchestrates SearchCommand with data loading
 * Loads categories and top merchants, manages search state
 */
export function SearchCommandContainer({
  placeholder,
  className,
  onMobileClick,
}: SearchCommandContainerProps) {
  const { query, setQuery, setCategory } = useSearchURLParams();
  const [value, setValue] = useState(query);
  const [categories, setCategories] = useState<MerchantCategory[]>([]);
  const [topMerchants, setTopMerchants] = useState<AlgoliaMerchantRecord[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMerchants, setLoadingMerchants] = useState(true);

  // Sync value with URL query param
  useEffect(() => {
    setValue(query || "");
  }, [query]);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getMerchantCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Load top 20 merchants on mount
  useEffect(() => {
    async function loadTopMerchants() {
      try {
        console.log("🔍 Fetching top merchants from products...");

        // Fetch all records (no type filter) to extract merchants
        const response = await searchViaAPI("", {
          hitsPerPage: 100, // Get more products to extract unique merchants
        });

        console.log("📦 Records fetched:", response.hits.length);
        console.log("📦 Type distribution:", response.typeDistribution);

        // Extract unique merchants from products
        const merchantMap = new Map<number, AlgoliaMerchantRecord>();

        response.hits.forEach((hit) => {
          if (hit.type === "merchant" && "wildfireMerchantId" in hit && "merchantName" in hit) {
            const merchantId = hit.wildfireMerchantId;
            if (merchantId && !merchantMap.has(merchantId)) {
              // Create a merchant record from merchant data
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
                logoUrl: hit.logoUrl,
              };
              merchantMap.set(merchantId, merchantRecord);
            }
          }
        });

        // Convert to array and sort by merchant score
        const merchants = Array.from(merchantMap.values())
          .sort((a, b) => (b.merchantScore || 0) - (a.merchantScore || 0))
          .slice(0, 20);

        console.log("✅ Extracted unique merchants:", merchants.length);
        setTopMerchants(merchants);
      } catch (error) {
        console.error("❌ Error loading top merchants:", error);
      } finally {
        setLoadingMerchants(false);
      }
    }
    loadTopMerchants();
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
    },
    [setQuery],
  );

  const handleCategorySelect = useCallback(
    (categorySlug: string) => {
      setValue(""); // Clear the input field
      setCategory(categorySlug);
    },
    [setCategory],
  );

  const handleMerchantSelect = useCallback(
    (merchantName: string) => {
      setValue(merchantName);
      setQuery(merchantName);
    },
    [setQuery],
  );

  return (
    <SearchCommand
      value={value}
      onValueChange={setValue}
      onSearch={handleSearch}
      onCategorySelect={handleCategorySelect}
      onMerchantSelect={handleMerchantSelect}
      placeholder={placeholder}
      categories={categories}
      topMerchants={topMerchants}
      loading={loadingCategories || loadingMerchants}
      className={className}
      onMobileClick={onMobileClick}
    />
  );
}
