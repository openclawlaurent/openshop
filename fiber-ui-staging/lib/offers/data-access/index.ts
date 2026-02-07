// Client-side exports (safe for Client Components)
export { getOffers } from "./offers-client";
export type { Offer } from "@/app/api/offers/route";

// Server-side exports (ONLY import in Server Components)
// Use: import { getOffersSSR } from "@/lib/offers/data-access/server"
