import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Fetch all merchant categories (admin only, includes inactive)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email?.endsWith("@fiber.shop")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("merchant_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Create new category
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email?.endsWith("@fiber.shop")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.slug || !body.label) {
      return NextResponse.json({ error: "slug and label are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("merchant_categories")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear cache when categories change
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/api/cache/revalidate?tag=merchant-filters`,
        {
          method: "POST",
        },
      );
    } catch (cacheError) {
      console.error("Error clearing cache:", cacheError);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/merchant-categories:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
