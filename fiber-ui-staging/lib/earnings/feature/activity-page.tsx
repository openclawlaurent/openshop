import { ActivityStats } from "../ui/activity-stats";
import { CashbackTransactions } from "../ui/cashback-transactions";
import { CashbackTransactionUI } from "@/types/cashback-transaction";
import type { ActivityStatsData } from "../content/types";

interface ActivityPageProps {
  completedTransactions: CashbackTransactionUI[];
  pendingTransactions: CashbackTransactionUI[];
  stats: ActivityStatsData;
}

export function ActivityPageContent({
  completedTransactions,
  pendingTransactions,
  stats,
}: ActivityPageProps) {
  return (
    <div className="w-full max-w-6xl mx-auto md:p-5" data-testid="tokens-page">
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Tokens</h1>
          <p className="text-muted-foreground">Track your tokens</p>
        </div>
      </div>

      <div className="space-y-6">
        <ActivityStats stats={stats} />
        <CashbackTransactions
          completedTransactions={completedTransactions}
          pendingTransactions={pendingTransactions}
        />
      </div>
    </div>
  );
}
