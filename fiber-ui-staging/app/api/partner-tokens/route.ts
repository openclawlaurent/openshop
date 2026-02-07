import { NextResponse } from "next/server";
import { getPartnerTokens } from "@/lib/data/partner-tokens";

export async function GET() {
  try {
    const partnerTokens = await getPartnerTokens();
    return NextResponse.json(partnerTokens);
  } catch (error) {
    console.error("Error fetching partner tokens1:", error);
    return NextResponse.json({ error: "Failed to fetch partner tokens" }, { status: 500 });
  }
}
