"use client";
import { useCurrentUserAnalytics } from "@/hooks/api/useUsers";
import {
  DashboardHeader,
  StatsGrid,
  ConnectedServices,
  RecentActivity,
  ConnectedServicesSkeleton,
} from "./_components";

export default function DashboardPage() {
  const { data: analytics, isLoading, error } = useCurrentUserAnalytics(30);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />
        <StatsGrid analytics={analytics} isLoading={isLoading} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {isLoading ? <ConnectedServicesSkeleton /> : <ConnectedServices />}
          <RecentActivity analytics={analytics} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
