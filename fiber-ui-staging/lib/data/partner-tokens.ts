import { createServiceRoleClient } from "@/lib/supabase/server";

export interface PartnerToken {
  id: string;
  symbol: string;
  name: string;
  network: string;
  display_label: string;
  brand_color: string | null;
  icon_url: string | null;
  contract_address: string | null;
  is_stablecoin: boolean | null;
  conversion_enabled: boolean | null;
  status: string | null;
  min_transfer_amount: number | null;
  max_transfer_amount: number | null;
  slippage_tolerance: number | null;
}

/**
 * Server-side function to get active partner tokens using service role key
 * Uses service role to bypass RLS for reference data access
 */
export async function getPartnerTokens(): Promise<PartnerToken[]> {
  try {
    const supabase = createServiceRoleClient();
    console.log("[getPartnerTokens] Using service role client");

    const { data, error } = await supabase
      .from("partner_tokens")
      .select("*")
      .eq("status", "active")
      .eq("is_available_for_payout", true)
      .order("symbol");

    if (error) {
      console.error("[getPartnerTokens] Error fetching partner tokens3:", error);
      return [];
    }

    console.log(`[getPartnerTokens] Successfully fetched ${data?.length || 0} tokens`);
    return data || [];
  } catch (error) {
    console.error("[getPartnerTokens] Exception while getting partner tokens:", error);
    return [];
  }
}
