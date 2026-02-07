import { ActivityPageContent } from "@/lib/earnings/feature";
import { ProtectedPageWrapper } from "@/lib/auth/feature/protected-page-wrapper";
import { createClient } from "@/lib/supabase/server";
import { getActivityTransactions } from "@/lib/earnings/data-access/server";
import { CashbackTransactionUI } from "@/types/cashback-transaction";
// import { DEMO_ACTIVITY_TRANSACTIONS } from "@/lib/demo/activity-demo-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokens",
  description: "Track your tokens",
};

export default async function TokensPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let completedTransactions: CashbackTransactionUI[] = [];
  let pendingTransactions: CashbackTransactionUI[] = [];
  let stats: {
    completed: { items: { token: string; amount: number; formatted: string }[]; count: number };
    pending: { items: { token: string; amount: number; formatted: string }[]; count: number };
  } = { completed: { items: [], count: 0 }, pending: { items: [], count: 0 } };

  if (user) {
    const result = await getActivityTransactions(user.id);
    completedTransactions = result.completedTransactions;
    pendingTransactions = result.pendingTransactions;
    stats = result.stats;
  }

  // ========== DEMO DATA ==========
  // Uncomment the line below to use demo data for testing
  // if (process.env.APP_ENV === "production") {
  //   transactions = DEMO_ACTIVITY_TRANSACTIONS;
  // }
  // ===============================

  return (
    <ProtectedPageWrapper pageName="Tokens">
      <ActivityPageContent
        completedTransactions={completedTransactions}
        pendingTransactions={pendingTransactions}
        stats={stats}
      />
    </ProtectedPageWrapper>
  );
}
