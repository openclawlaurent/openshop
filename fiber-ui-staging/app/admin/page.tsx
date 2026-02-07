import { createClient } from "@/lib/supabase/server";
import { SimulationActions } from "@/lib/admin/ui";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return <SimulationActions userId={user.id} />;
}
