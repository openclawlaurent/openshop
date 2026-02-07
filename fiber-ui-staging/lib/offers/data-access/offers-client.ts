import { Offer } from "@/app/api/offers/route";

/**
 * Client-side offer fetching
 * Safe to import in Client Components
 */
export async function getOffers(query?: string, category?: string): Promise<Offer[]> {
  try {
    // Use the API route that handles both Algolia and fallback
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (category) params.append("category", category);

    const response = await fetch(`/api/offers?${params.toString()}`);

    if (!response.ok) {
      console.error("Failed to fetch offers:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.offers || [];
  } catch (error) {
    console.error("Error fetching offers:", error);
    return [];
  }
}
