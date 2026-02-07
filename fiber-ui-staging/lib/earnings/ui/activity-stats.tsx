"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Clock, Coins, ChevronDown } from "lucide-react";
import { Button } from "@/lib/ui/data-display/button";
import { useState } from "react";
import { ActivityStatsData } from "../content/types";

interface ActivityStatsProps {
  stats: ActivityStatsData;
}

export function ActivityStats({ stats }: ActivityStatsProps) {
  const [expandedPending, setExpandedPending] = useState(false);
  const [expandedCompleted, setExpandedCompleted] = useState(false);

  // Show first 2 cryptos by default, rest in expanded view
  const displayedCompletedEarnings = expandedCompleted
    ? stats.completed.items
    : stats.completed.items.slice(0, 2);
  const hasMoreCompleted = stats.completed.items.length > 2;

  const displayedPendingEarnings = expandedPending
    ? stats.pending.items
    : stats.pending.items.slice(0, 2);
  const hasMorePending = stats.pending.items.length > 2;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Total Earnings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.completed.items.length === 0 ? (
            <div className="text-2xl font-bold text-muted-foreground">None</div>
          ) : (
            <div className="space-y-1">
              {displayedCompletedEarnings.map((crypto) => (
                <div key={crypto.token} className="text-xl font-bold">
                  {crypto.formatted}
                </div>
              ))}
              {hasMoreCompleted && !expandedCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setExpandedCompleted(true)}
                >
                  <ChevronDown className="h-3 w-3 mr-1" />+{stats.completed.items.length - 2} more
                </Button>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {stats.completed.count} completed {stats.completed.count === 1 ? "offer" : "offers"}
          </p>
        </CardContent>
      </Card>

      {/* Pending Earnings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.pending.items.length === 0 ? (
            <div className="text-2xl font-bold text-muted-foreground">None</div>
          ) : (
            <div className="space-y-1">
              {displayedPendingEarnings.map((crypto) => (
                <div key={crypto.token} className="text-xl font-bold">
                  {crypto.formatted}
                </div>
              ))}
              {hasMorePending && !expandedPending && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setExpandedPending(true)}
                >
                  <ChevronDown className="h-3 w-3 mr-1" />+{stats.pending.items.length - 2} more
                </Button>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {stats.pending.count} pending merchant confirmation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
