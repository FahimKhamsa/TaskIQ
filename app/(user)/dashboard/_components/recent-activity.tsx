"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ActivityLogItem } from "./activity-log-item";
import { RecentActivitySkeleton } from "./recent-activity-skeleton";

interface RecentActivityProps {
  analytics: any;
  isLoading: boolean;
}

export function RecentActivity({ analytics, isLoading }: RecentActivityProps) {
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);

  // Only show skeleton on true initial load (no cached data)
  if (isLoading) {
    return <RecentActivitySkeleton />;
  }

  // Get logs to display (first 3 for collapsed, all for expanded)
  const logsToShow = isActivityExpanded
    ? analytics?.breakdown?.recentLogs || []
    : analytics?.breakdown?.recentLogs?.slice(0, 3) || [];

  const totalLogs = analytics?.breakdown?.recentLogs?.length || 0;

  return (
    <>
      {/* Backdrop overlay for full-screen modal */}
      {isActivityExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
          onClick={() => setIsActivityExpanded(false)}
        />
      )}

      <Card
        className={`bg-gradient-card border-border shadow-card transition-all duration-700 ease-in-out transform ${
          isActivityExpanded
            ? "fixed inset-4 z-50 scale-100 opacity-100"
            : "relative scale-100 opacity-100"
        }`}
        style={{
          transformOrigin: isActivityExpanded ? "center" : "top right",
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your latest bot interactions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={totalLogs <= 3}
              onClick={() => setIsActivityExpanded(!isActivityExpanded)}
              className="flex items-center gap-2"
            >
              {isActivityExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  View All ({totalLogs})
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`space-y-4 transition-all duration-300 ease-in-out ${
              isActivityExpanded
                ? "max-h-[calc(100vh-12rem)] overflow-y-auto"
                : "max-h-none"
            }`}
          >
            {logsToShow.length > 0 ? (
              logsToShow.map((log: any, index: number) => (
                <ActivityLogItem
                  key={log.id}
                  log={log}
                  index={index}
                  isExpanded={isActivityExpanded}
                />
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No recent activity found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
