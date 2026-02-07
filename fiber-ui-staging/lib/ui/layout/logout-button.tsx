"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/lib/ui/data-display/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button onClick={logout} size="lg">
      Sign out
    </Button>
  );
}
