/**
 * Server-side service layer for fetching merchant filter configurations
 * Use these functions in server components and API routes
 * For client components, use merchant-filters-client.ts instead
 */

import { createClient } from "@/lib/supabase/server";

// Re-export types for convenience
export type { MerchantCategory, MerchantSortOption } from "./merchant-filters-client";

/**
 * SERVER-SIDE FUNCTIONS
 * These functions directly query Supabase without HTTP requests
 * Use these in server components and API routes
 */

/**
 * Fetch active merchant categories (server-side)
 * Filters out seasonal categories that are outside their date range
 */
export async function getMerchantCategoriesServer() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("merchant_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching merchant categories from database:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Filter seasonal categories by date
    const now = new Date();
    const activeCategories = data.filter((category) => {
      if (!category.is_seasonal) return true;
      if (!category.start_date || !category.end_date) return true;

      const startDate = new Date(category.start_date);
      const endDate = new Date(category.end_date);
      return now >= startDate && now <= endDate;
    });

    return activeCategories;
  } catch (error) {
    console.error("Error in getMerchantCategoriesServer:", error);
    return [];
  }
}

/**
 * Fetch active sort options (server-side)
 */
export async function getMerchantSortOptionsServer() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("merchant_sort_options")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching sort options from database:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in getMerchantSortOptionsServer:", error);
    return [];
  }
}

/**
 * Get category by slug (server-side)
 */
export async function getCategoryBySlug(slug: string) {
  const categories = await getMerchantCategoriesServer();
  return categories.find((cat) => cat.slug === slug) || null;
}

/**
 * Get sort option by slug (server-side)
 */
export async function getSortOptionBySlug(slug: string) {
  const sortOptions = await getMerchantSortOptionsServer();
  return sortOptions.find((opt) => opt.slug === slug) || null;
}
