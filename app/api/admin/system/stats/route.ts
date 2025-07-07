import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check

    // Get comprehensive system statistics
    const stats = await getSystemStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getSystemStats() {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    // User statistics
    totalUsers,
    newUsersLast24h,
    newUsersLast7d,
    newUsersLast30d,
    activeUsersLast24h,

    // Subscription statistics
    totalSubscriptions,
    activeSubscriptions,
    subscriptionsByPlan,

    // Credit statistics
    totalCreditsUsed,
    creditsUsedLast24h,
    creditsUsedLast7d,

    // Log statistics
    totalLogs,
    logsLast24h,
    logsByType,

    // Offer statistics
    totalOffers,
    activeOffers,
    totalOfferClaims,

    // Announcement statistics
    totalAnnouncements,
    publishedAnnouncements,

    // System performance
    avgResponseTime,
  ] = await Promise.all([
    // User statistics
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: last24Hours } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: last7Days } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: last30Days } },
    }),
    prisma.log.findMany({
      where: { createdAt: { gte: last24Hours } },
      select: { userId: true },
      distinct: ["userId"],
    }),

    // Subscription statistics
    prisma.subscription.count(),
    prisma.subscription.count({
      where: { isSubscribed: true },
    }),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),

    // Credit statistics
    prisma.credit.aggregate({
      _sum: { usedToday: true },
    }),
    prisma.log.count({
      where: {
        createdAt: { gte: last24Hours },
        content: { contains: "Consumed" },
      },
    }),
    prisma.log.count({
      where: {
        createdAt: { gte: last7Days },
        content: { contains: "Consumed" },
      },
    }),

    // Log statistics
    prisma.log.count(),
    prisma.log.count({
      where: { createdAt: { gte: last24Hours } },
    }),
    prisma.log.groupBy({
      by: ["type"],
      _count: { type: true },
    }),

    // Offer statistics
    prisma.offer.count(),
    prisma.offer.count({
      where: { offerStatus: true },
    }),
    prisma.offerClaim.count(),

    // Announcement statistics
    prisma.announcement.count(),
    prisma.announcement.count({
      where: { currentStatus: "PUBLISHED" },
    }),

    // System performance (mock data - in real app, you'd track this)
    Promise.resolve(150), // Average response time in ms
  ]);

  // Process subscription data
  const planDistribution = subscriptionsByPlan.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item.plan || "UNKNOWN"] = item._count.plan;
      return acc;
    },
    {}
  );

  // Process log data
  const logTypeDistribution = logsByType.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item.type || "UNKNOWN"] = item._count.type;
      return acc;
    },
    {}
  );

  // Calculate growth rates
  const userGrowthRate24h =
    totalUsers > 0 ? (newUsersLast24h / totalUsers) * 100 : 0;
  const userGrowthRate7d =
    totalUsers > 0 ? (newUsersLast7d / totalUsers) * 100 : 0;
  const userGrowthRate30d =
    totalUsers > 0 ? (newUsersLast30d / totalUsers) * 100 : 0;

  // Calculate conversion rate
  const conversionRate =
    totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;

  return {
    overview: {
      totalUsers,
      activeSubscriptions,
      totalCreditsUsed: totalCreditsUsed._sum.usedToday || 0,
      totalLogs,
      systemUptime: process.uptime(),
      avgResponseTime,
    },
    users: {
      total: totalUsers,
      new24h: newUsersLast24h,
      new7d: newUsersLast7d,
      new30d: newUsersLast30d,
      active24h: activeUsersLast24h.length,
      growthRates: {
        last24h: Math.round(userGrowthRate24h * 100) / 100,
        last7d: Math.round(userGrowthRate7d * 100) / 100,
        last30d: Math.round(userGrowthRate30d * 100) / 100,
      },
    },
    subscriptions: {
      total: totalSubscriptions,
      active: activeSubscriptions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      planDistribution,
    },
    credits: {
      totalUsed: totalCreditsUsed._sum.usedToday || 0,
      used24h: creditsUsedLast24h,
      used7d: creditsUsedLast7d,
    },
    logs: {
      total: totalLogs,
      last24h: logsLast24h,
      typeDistribution: logTypeDistribution,
    },
    offers: {
      total: totalOffers,
      active: activeOffers,
      totalClaims: totalOfferClaims,
    },
    announcements: {
      total: totalAnnouncements,
      published: publishedAnnouncements,
    },
    performance: {
      avgResponseTime,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
    timestamp: new Date().toISOString(),
  };
}
