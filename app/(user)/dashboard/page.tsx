"use client";
import { useEffect } from "react";
import { useCurrentUserAnalytics } from "@/hooks/api/useUsers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DashboardHeader,
  StatsGrid,
  ConnectedServices,
  RecentActivity,
  ConnectedServicesSkeleton,
} from "./_components";

export default function DashboardPage() {
  const {
    data: analytics,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCurrentUserAnalytics(30);
  const { toast } = useToast();

  // Smart loading logic: only show skeletons if no cached data AND loading
  const isInitialLoad = isLoading && !analytics;
  const hasData = !!analytics;
  const isBackgroundRefresh = isFetching && hasData;

  // Handle background refresh errors (when we have cached data but refresh fails)
  useEffect(() => {
    if (error && hasData && !isLoading) {
      toast({
        title: "Failed to refresh data",
        description: "Showing cached data. Tap to retry.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        ),
      });
    }
  }, [error, hasData, isLoading, toast, refetch]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />

        {/* Show background refresh indicator */}
        {isBackgroundRefresh && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              Refreshing data...
            </div>
          </div>
        )}

        <StatsGrid analytics={analytics} isLoading={isInitialLoad} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {isInitialLoad ? (
            <ConnectedServicesSkeleton />
          ) : (
            <ConnectedServices />
          )}
          <RecentActivity analytics={analytics} isLoading={isInitialLoad} />
        </div>
      </div>
    </div>
  );
}
