import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Fetch active sort options (public endpoint)
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("merchant_sort_options")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching sort options:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
