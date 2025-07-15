import { Activity, CreditCard, Bot, DollarSign } from "lucide-react";
import { StatCard } from "./stat-card";
import { StatsGridSkeleton } from "./stats-grid-skeleton";

interface StatsGridProps {
  analytics: any;
  isLoading: boolean;
}

export function StatsGrid({ analytics, isLoading }: StatsGridProps) {
  // Only show skeleton on true initial load (no cached data)
  if (isLoading) {
    return <StatsGridSkeleton />;
  }

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  // Calculate percentage for credits remaining
  const creditsPercentage = analytics?.summary?.dailyLimit
    ? Math.round(
        ((analytics.summary.dailyLimit - analytics.summary.usedToday) /
          analytics.summary.dailyLimit) *
          100
      )
    : 0;

  // Provide fallback values for when analytics is undefined (shouldn't happen with persistence)
  const safeAnalytics = analytics || {
    summary: {
      totalLogs: 0,
      dailyLimit: 0,
      usedToday: 0,
      totalSpent: 0,
      planType: "FREE",
    },
  };

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={"Commands Used"}
        value={formatNumber(analytics?.summary?.totalLogs || 0)}
        description={"Last 30 days"}
        icon={Activity}
      />
      <StatCard
        title={"Credits Remaining"}
        value={`${
          analytics?.summary?.dailyLimit - analytics?.summary?.usedToday || 0
        }`}
        description={`Out of ${analytics?.summary?.dailyLimit || 0}`}
        icon={CreditCard}
      />
      <StatCard
        title={"Total Spent"}
        value={`$${analytics?.summary?.totalSpent?.toFixed(2) || "0.00"}`}
        description={"All time spending"}
        icon={DollarSign}
      />
      <StatCard
        title={"Plan Type"}
        value={analytics?.summary?.planType || "FREE"}
        description={"Current subscription"}
        icon={Bot}
      />
    </div>
  );
}
