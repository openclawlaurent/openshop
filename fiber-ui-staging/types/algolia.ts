// New Algolia record types for wildfire_v2 indexes

export interface AlgoliaMerchantRecord {
  objectID: string;
  type: "merchant";
  wildfireMerchantId: number;
  merchantName: string;
  domain: string;
  maxRateAmount: number; // The highest rate value
  maxRateType: string; // "fixed" for flat rates, "percentage" for percentage rates
  merchantUrl?: string;
  logoUrl?: string;
  description?: string;
  searchKeywords?: string[];
  alternativeNames?: string[];
  collectionIds?: number[];
  productCount?: number;
  isPriority?: boolean;
  merchantScore?: number;
  activeDomainId?: number;
  countries?: string[];
  paysNewCustomersOnly?: boolean;
  shareAndEarnDisabled?: boolean;
  serpInjectionDisabled?: boolean;
  browserExtensionDisabled?: boolean;
  __queryID?: string; // Algolia's internal field for click analytics
  allRates?: Array<{
    name: string;
    rate?: string;
    amount: number | string;
    type?: string;
    kind?: string; // "PERCENTAGE" or "FLAT"
    currency?: string;
    wildfireId?: number;
  }>;
  lastUpdated?: string;
}

export interface AlgoliaCollectionRecord {
  objectID: string;
  type: "collection";
  collectionId: number;
  collectionName: string;
  collectionSlug: string;
  collectionType?: "category" | "sale" | "seasonal" | "curated" | "brand";
  collectionPath?: string[]; // e.g., ["Men", "Shoes", "Running"]
  collectionLevel?: number; // 0 for root, 1+ for nested
  productCount?: number;
  merchantCount?: number;
  searchKeywords?: string[];
  description?: string;
  parentCollectionId?: number;
  childCollectionIds?: number[];
  imageUrl?: string;
  sourceUrl?: string;
  isActive?: boolean;
  lastUpdated?: string;
  __queryID?: string; // Algolia's internal field for click analytics
}

export interface AlgoliaProductRecord {
  objectID: string;
  type: "product";
  productId?: string; // Optional as it may come from objectID
  productTitle: string;
  merchantId: number;
  wildfireMerchantId?: number; // New field name from Algolia
  merchantName: string;
  merchantLogoUrl?: string; // Merchant favicon/logo
  merchantScore?: number;
  __queryID?: string; // Algolia's internal field for click analytics
  price?: number;
  originalPrice?: string; // Raw price from source (can be string)
  priceFormatted?: string; // e.g., "$99.99"
  inStock?: boolean;
  maxRateAmount: number; // The highest rate value
  maxRateType: string; // "fixed" for flat rates, "percentage" for percentage rates
  brand?: string;
  description?: string;
  imageUrl?: string;
  domain?: string;
  sourceUrl?: string;
  collectionIds?: number[];
  categoryIds?: number[];
  primaryCollectionId?: number;
  primaryCategoryId?: number;
  searchKeywords?: string[];
  countries?: string[];
  allRates?: Array<{
    name: string;
    rate?: string;
    amount: number | string;
    type?: string;
    kind?: string; // Added: actual field name from Algolia
    wildfireId?: number;
  }>;
  lastUpdated?: string;
  sku?: string;
  color?: string;
  size?: string;
  rating?: number;
  reviewCount?: number;
  discountPercentage?: number;
  tags?: string[];
  isPriority?: boolean;
  paysNewCustomersOnly?: boolean;
  shareAndEarnDisabled?: boolean;
  serpInjectionDisabled?: boolean;
  browserExtensionDisabled?: boolean;
}

// Union type for unified search results
export type AlgoliaUnifiedRecord =
  | AlgoliaMerchantRecord
  | AlgoliaCollectionRecord
  | AlgoliaProductRecord;

// Search filters for the unified index structure
export interface AlgoliaSearchFilters {
  // Common filters
  type?: "merchant" | "product" | "collection" | ("merchant" | "product" | "collection")[];

  // Merchant-specific filters
  isPriority?: boolean;
  countries?: string[];
  minCashback?: number;
  maxCashback?: number;
  minMaxRate?: number; // Minimum maxRate value (exclude items with maxRate = 0)
  paysNewCustomersOnly?: boolean;
  excludeWildfireMerchantIds?: number[]; // Exclude specific wildfire merchant IDs

  // Product-specific filters
  merchantId?: number | number[];
  brand?: string | string[];
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  color?: string | string[];
  size?: string | string[];

  // Collection-specific filters
  collectionType?:
    | "category"
    | "sale"
    | "seasonal"
    | "curated"
    | "brand"
    | ("category" | "sale" | "seasonal" | "curated" | "brand")[];
  collectionLevel?: number;
  parentCollectionId?: number;

  // Cross-type filters
  collectionIds?: number[];
  primaryCollectionId?: number;
}

// Search options for the unified API
export interface AlgoliaSearchOptions {
  hitsPerPage?: number;
  page?: number;
  filters?: AlgoliaSearchFilters;
  facets?: boolean;
  sortBy?: string; // Dynamic sort options from database (e.g., "bestRateAmount:desc", "popularityScore:desc")
}

// Enhanced search response with type-aware results
export interface AlgoliaSearchResponse {
  hits: AlgoliaUnifiedRecord[];
  totalHits: number;
  totalPages: number;
  currentPage: number;
  queryID?: string; // For click analytics tracking
  facets?: Record<string, Record<string, number>>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  // Type distribution in results
  typeDistribution?: {
    merchant: number;
    product: number;
    collection: number;
  };
}

// Autocomplete suggestion types
export interface AlgoliaMerchantSuggestion {
  type: "merchant";
  name: string;
  merchantId: number;
  imageUrl?: string;
  domain?: string;
  maxRateAmount?: number;
  maxRateType?: string;
}

export interface AlgoliaProductSuggestion {
  type: "product";
  name: string;
  productId: string;
  merchantName: string;
  price?: number;
  priceFormatted?: string;
  imageUrl?: string;
}

export interface AlgoliaCollectionSuggestion {
  type: "collection";
  name: string;
  collectionId: number;
  collectionType?: string;
  productCount?: number;
}

export type AlgoliaAutocompleteSuggestion =
  | AlgoliaMerchantSuggestion
  | AlgoliaProductSuggestion
  | AlgoliaCollectionSuggestion;

// Index configuration
export interface AlgoliaIndexConfig {
  unifiedIndex: string;
  // merchantIndex: string;
  // productIndex: string;
  // collectionIndex: string;
}

// Helper type guards
export function isMerchantRecord(record: AlgoliaUnifiedRecord): record is AlgoliaMerchantRecord {
  return record.type === "merchant";
}

export function isProductRecord(record: AlgoliaUnifiedRecord): record is AlgoliaProductRecord {
  return record.type === "product";
}

export function isCollectionRecord(
  record: AlgoliaUnifiedRecord,
): record is AlgoliaCollectionRecord {
  return record.type === "collection";
}
