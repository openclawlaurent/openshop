import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Fetch active merchant categories (public endpoint)
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("merchant_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  return NextResponse.json(activeCategories);
}
