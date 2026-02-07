import { NextResponse } from "next/server";
import { getBoostTiers } from "@/lib/tiers/data-access/server";

export async function GET() {
  try {
    const boostTiers = await getBoostTiers();
    return NextResponse.json(boostTiers);
  } catch (error) {
    console.error("Error in boost tiers API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
