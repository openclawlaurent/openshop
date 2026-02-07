import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/lib/admin/feature/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is logged in and has @fiber.shop email
  const isAdmin = user?.email?.endsWith("@fiber.shop") ?? false;

  if (!user) {
    redirect("/auth/login");
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">403</h1>
          <p className="text-xl text-muted-foreground">Access Denied</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Only Fiber admins with @fiber.shop email addresses can access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="inline-block rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Admin Only
        </div>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage simulations, cache, and merchant configurations
        </p>
      </div>

      <AdminNav />

      <div className="mt-6">{children}</div>
    </div>
  );
}
