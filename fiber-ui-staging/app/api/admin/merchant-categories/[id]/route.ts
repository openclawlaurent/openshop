import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH - Update category
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email?.endsWith("@fiber.shop")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = await params;

    const { data, error } = await supabase
      .from("merchant_categories")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH /api/admin/merchant-categories/[id]:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE - Delete category
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email?.endsWith("@fiber.shop")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Prevent deleting the "all" category
    const { data: category } = await supabase
      .from("merchant_categories")
      .select("slug")
      .eq("id", id)
      .single();

    if (category?.slug === "all") {
      return NextResponse.json({ error: "Cannot delete the 'all' category" }, { status: 400 });
    }

    const { error } = await supabase.from("merchant_categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/merchant-categories/[id]:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
