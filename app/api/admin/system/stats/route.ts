import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching system stats for admin:", user.id);

    // Get the latest admin analytics data first
    const latestAnalytics = await prisma.adminAnalytics.findFirst({
      orderBy: { createdAt: "desc" }
    });

    // Get real-time statistics from database
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalCreditsUsed,
      totalRevenue,
      recentUsers,
      topUsers,
      planDistribution,
      integrationStats,
      logStats
    ] = await Promise.all([
      // User counts
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "INACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      
      // Subscription stats
      prisma.subscription.count(),
      prisma.subscription.count({ where: { isSubscribed: true } }),
      
      // Credit usage
      prisma.credit.aggregate({
        _sum: { usedToday: true },
      }).then(result => result._sum.usedToday || 0),
      
      // Revenue (simplified calculation)
      prisma.subscription.count({ where: { isSubscribed: true } }).then(count => count * 10),
      
      // Recent users (last 30 days)
      prisma.user.findMany({
        take: 10,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
          subscription: {
            select: { plan: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      
      // Top users by activity (simplified)
      prisma.user.findMany({
        take: 10,
        include: {
          userAnalytics: true,
          subscription: true,
          credit: true,
          _count: {
            select: { logs: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      
      // Plan distribution
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true }
      }).catch(() => []),
      
      // Integration statistics
      prisma.userAnalytics.findMany({
        select: { activeIntegrations: true }
      }).then(analytics => {
        const allIntegrations = analytics.flatMap(a => a.activeIntegrations || []);
        const counts = allIntegrations.reduce((acc, integration) => {
          acc[integration] = (acc[integration] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).sort(([,a], [,b]) => b - a).slice(0, 5);
      }).catch(() => []),
      
      // Log statistics
      prisma.log.groupBy({
        by: ["type"],
        _count: { type: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }).catch(() => [])
    ]);

    // Use conversion rate from admin analytics if available, otherwise calculate
    const conversionRate = latestAnalytics?.conversionRate || 
      (totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0);

    // Process plan distribution
    const planMap = planDistribution.reduce((acc, item) => {
      acc[item.plan?.toLowerCase() || 'free'] = item._count.plan;
      return acc;
    }, {} as Record<string, number>);

    // Use data from admin analytics if available, otherwise use calculated data
    const formattedRecentUsers = latestAnalytics?.recentlyAddedUsers || 
      recentUsers.map(user => ({
        name: user.fullName || 'Unknown User',
        email: user.email || '',
        joined_at: user.createdAt?.toISOString() || new Date().toISOString(),
        plan: user.subscription?.plan || 'FREE'
      }));

    const formattedTopUsers = latestAnalytics?.topUsers || 
      topUsers.map(user => ({
        user: user.fullName || user.email || 'Unknown User',
        prompts: user._count.logs,
        credits_used: user.userAnalytics?.totalPromptPerDay || 0,
        joined_at: user.createdAt?.toISOString() || new Date().toISOString(),
      }));

    // Use most used commands from admin analytics if available
    const mostUsedCommands = latestAnalytics?.mostUsedCommands || 
      logStats.map(stat => stat.type).filter(Boolean);

    // Use active integrations from admin analytics if available
    const activeIntegrationsFromAnalytics = latestAnalytics?.activeIntegrations || 
      integrationStats.map(([name]) => name);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalCreditsUsed,
      totalRevenue: totalRevenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      planDistribution: {
        free: planMap.free || 0,
        monthly: planMap.monthly || 0,
        yearly: planMap.yearly || 0,
        bi_yearly: planMap.bi_yearly || 0,
      },
      recentUsers: formattedRecentUsers,
      topUsers: formattedTopUsers,
      activeIntegrations: activeIntegrationsFromAnalytics,
      mostUsedCommands,
      lastUpdated: new Date().toISOString()
    };

    console.log("System stats calculated:", {
      totalUsers,
      activeUsers,
      conversionRate,
      recentUsersCount: formattedRecentUsers.length,
      topUsersCount: formattedTopUsers.length,
      usingAnalyticsData: !!latestAnalytics
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
