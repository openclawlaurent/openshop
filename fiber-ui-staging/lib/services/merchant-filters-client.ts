/**
 * Client-side service layer for fetching merchant filter configurations
 * Used by client components to get active categories and sort options via API routes
 */

export interface MerchantCategory {
  id: string;
  slug: string;
  label: string;
  collection_ids: number[];
  search_keywords: string[];
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
  is_seasonal: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface MerchantSortOption {
  id: string;
  slug: string;
  label: string;
  algolia_sort_by: string | null;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
}

/**
 * Fetch active merchant categories (client-side)
 * Filters out seasonal categories that are outside their date range
 */
export async function getMerchantCategories(): Promise<MerchantCategory[]> {
  try {
    const response = await fetch("/api/merchant-filters/categories", {
      next: { tags: ["merchant-filters"], revalidate: 3600 }, // 1 hour cache
    });

    if (!response.ok) {
      throw new Error("Failed to fetch merchant categories");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching merchant categories:", error);
    return [];
  }
}

/**
 * Fetch active sort options (client-side)
 */
export async function getMerchantSortOptions(): Promise<MerchantSortOption[]> {
  try {
    const response = await fetch("/api/merchant-filters/sort-options", {
      next: { tags: ["merchant-filters"], revalidate: 3600 }, // 1 hour cache
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sort options");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching sort options:", error);
    return [];
  }
}

/**
 * Get default sort option
 */
export async function getDefaultSortOption(): Promise<MerchantSortOption | null> {
  const sortOptions = await getMerchantSortOptions();
  return sortOptions.find((opt) => opt.is_default) || sortOptions[0] || null;
}
