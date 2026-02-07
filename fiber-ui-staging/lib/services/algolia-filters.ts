import type { AlgoliaSearchFilters, AlgoliaUnifiedRecord } from "@/types/algolia";

/**
 * Shared Algolia filter building logic
 * Used by both client and server search implementations
 */

/**
 * Build filter string for Algolia search
 */
export function buildFilterString(filters: AlgoliaSearchFilters): string {
  const filterParts: string[] = [];

  // Type filter
  if (filters.type) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type];
    const typeFilters = types.map((type) => `type:${type}`).join(" OR ");
    filterParts.push(`(${typeFilters})`);
  }

  // Collection filters (cross-type)
  if (filters.collectionIds?.length) {
    const collectionFilters = filters.collectionIds.map((id) => `collectionIds:${id}`).join(" OR ");
    filterParts.push(`(${collectionFilters})`);
  }

  // Note: primaryCollectionId is intentionally NOT added here as a filter string
  // It should be handled as a numeric filter instead (see buildNumericFilters)

  // Merchant-specific filters
  if (filters.isPriority !== undefined) {
    filterParts.push(`isPriority:${filters.isPriority}`);
  }

  if (filters.countries?.length) {
    const countryFilters = filters.countries.map((country) => `countries:${country}`).join(" OR ");
    filterParts.push(`(${countryFilters})`);
  }

  if (filters.paysNewCustomersOnly !== undefined) {
    filterParts.push(`paysNewCustomersOnly:${filters.paysNewCustomersOnly}`);
  }

  // Exclude specific wildfire merchant IDs
  if (filters.excludeWildfireMerchantIds?.length) {
    const excludeFilters = filters.excludeWildfireMerchantIds
      .map((id) => `NOT wildfireMerchantId:${id}`)
      .join(" AND ");
    filterParts.push(`(${excludeFilters})`);
  }

  // Product-specific filters
  if (filters.merchantId !== undefined) {
    const merchantIds = Array.isArray(filters.merchantId)
      ? filters.merchantId
      : [filters.merchantId];
    const merchantFilters = merchantIds.map((id) => `merchantId:${id}`).join(" OR ");
    filterParts.push(`(${merchantFilters})`);
  }

  if (filters.brand) {
    const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
    const brandFilters = brands.map((brand) => `brand:${brand}`).join(" OR ");
    filterParts.push(`(${brandFilters})`);
  }

  if (filters.inStock !== undefined) {
    filterParts.push(`inStock:${filters.inStock}`);
  }

  if (filters.color) {
    const colors = Array.isArray(filters.color) ? filters.color : [filters.color];
    const colorFilters = colors.map((color) => `color:${color}`).join(" OR ");
    filterParts.push(`(${colorFilters})`);
  }

  if (filters.size) {
    const sizes = Array.isArray(filters.size) ? filters.size : [filters.size];
    const sizeFilters = sizes.map((size) => `size:${size}`).join(" OR ");
    filterParts.push(`(${sizeFilters})`);
  }

  // Collection-specific filters
  if (filters.collectionType) {
    const types = Array.isArray(filters.collectionType)
      ? filters.collectionType
      : [filters.collectionType];
    const typeFilters = types.map((type) => `collectionType:${type}`).join(" OR ");
    filterParts.push(`(${typeFilters})`);
  }

  if (filters.collectionLevel !== undefined) {
    filterParts.push(`collectionLevel:${filters.collectionLevel}`);
  }

  if (filters.parentCollectionId !== undefined) {
    filterParts.push(`parentCollectionId:${filters.parentCollectionId}`);
  }

  return filterParts.join(" AND ");
}

/**
 * Build numeric filters for price, rating, cashback, etc.
 */
export function buildNumericFilters(filters: AlgoliaSearchFilters): string[] {
  const numericFilters: string[] = [];

  // Price filters
  if (filters.minPrice !== undefined) {
    numericFilters.push(`price >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    numericFilters.push(`price <= ${filters.maxPrice}`);
  }

  // Cashback filters
  if (filters.minCashback !== undefined) {
    numericFilters.push(`maxRateAmount >= ${filters.minCashback}`);
  }
  if (filters.maxCashback !== undefined) {
    numericFilters.push(`maxRateAmount <= ${filters.maxCashback}`);
  }

  // MaxRate filter (exclude items with 0% cashback)
  if (filters.minMaxRate !== undefined) {
    numericFilters.push(`maxRateAmount >= ${filters.minMaxRate}`);
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    numericFilters.push(`rating >= ${filters.minRating}`);
  }

  // Primary Collection ID filter (numeric equality)
  if (filters.primaryCollectionId !== undefined) {
    numericFilters.push(`primaryCollectionId = ${filters.primaryCollectionId}`);
  }

  return numericFilters;
}

/**
 * Get facet configuration based on filters and search context
 */
export function getFacetConfig(filters?: AlgoliaSearchFilters): string[] {
  const facets = ["type"];

  // Always include common facets
  facets.push("collectionIds", "primaryCollectionId");

  // Add type-specific facets based on filters or include all
  if (!filters?.type || (Array.isArray(filters.type) && filters.type.includes("merchant"))) {
    facets.push("isPriority", "countries", "paysNewCustomersOnly");
  }

  if (!filters?.type || (Array.isArray(filters.type) && filters.type.includes("product"))) {
    facets.push("merchantId", "brand", "inStock", "color", "size");
  }

  if (!filters?.type || (Array.isArray(filters.type) && filters.type.includes("collection"))) {
    facets.push("collectionType", "collectionLevel", "parentCollectionId");
  }

  return facets;
}

/**
 * Calculate type distribution from search results
 */
export function calculateTypeDistribution(hits: AlgoliaUnifiedRecord[]) {
  return hits.reduce(
    (acc, hit) => {
      acc[hit.type]++;
      return acc;
    },
    { merchant: 0, product: 0, collection: 0 },
  );
}
