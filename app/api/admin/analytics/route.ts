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

    // TODO: Add admin role check

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get comprehensive analytics
    const analytics = await getAdminAnalytics(startDate);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      totalUsers,
      topUsers,
      activeIntegrations,
      conversionRate,
      mostUsedCommands,
      recentlyAddedUsers,
    } = body;

    // Update or create admin analytics
    const adminAnalytics = await prisma.adminAnalytics.create({
      data: {
        totalUsers,
        topUsers,
        activeIntegrations,
        conversionRate,
        mostUsedCommands,
        recentlyAddedUsers,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ analytics: adminAnalytics }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getAdminAnalytics(startDate: Date) {
  const [
    totalUsers,
    newUsersInPeriod,
    activeSubscriptions,
    totalRevenue,
    planDistribution,
    topUsers,
    recentActivity,
    creditUsage,
    integrationStats,
    logStats,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // New users in period
    prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),

    // Active subscriptions
    prisma.subscription.count({
      where: { isSubscribed: true },
    }),

    // Total revenue (from pricing)
    prisma.subscription.findMany({
      where: {
        isSubscribed: true,
        pricing: {
          price: {
            not: null,
          },
        },
      },
      include: {
        pricing: true,
      },
    }),

    // Plan distribution
    Promise.all([
      prisma.subscription.count({ where: { plan: "FREE" } }),
      prisma.subscription.count({ where: { plan: "PRO" } }),
      prisma.subscription.count({ where: { plan: "ENTERPRISE" } }),
    ]),

    // Top users by activity
    prisma.user.findMany({
      take: 10,
      include: {
        userAnalytics: true,
        _count: {
          select: {
            logs: true,
          },
        },
      },
      orderBy: {
        logs: {
          _count: "desc",
        },
      },
    }),

    // Recent activity
    prisma.log.findMany({
      take: 20,
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Credit usage stats
    prisma.credit.aggregate({
      _sum: {
        usedToday: true,
        dailyLimit: true,
      },
      _avg: {
        usedToday: true,
        dailyLimit: true,
      },
    }),

    // Integration statistics
    prisma.userAnalytics.findMany({
      select: {
        activeIntegrations: true,
      },
    }),

    // Log statistics
    prisma.log.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
  ]);

  // Calculate revenue
  const revenue = totalRevenue.reduce((sum: number, sub: any) => {
    return sum + (sub.pricing?.price || 0);
  }, 0);

  // Calculate conversion rate
  const conversionRate =
    totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;

  // Process integration stats
  const allIntegrations = integrationStats.flatMap(
    (analytics: any) => analytics.activeIntegrations || []
  );
  const integrationCounts = allIntegrations.reduce(
    (acc: Record<string, number>, integration: any) => {
      acc[integration] = (acc[integration] || 0) + 1;
      return acc;
    },
    {}
  );

  // Process log stats
  const logStatsByType = logStats.reduce(
    (acc: Record<string, number>, stat: any) => {
      acc[stat.type || "UNKNOWN"] = stat._count.type;
      return acc;
    },
    {}
  );

  return {
    overview: {
      totalUsers,
      newUsersInPeriod,
      activeSubscriptions,
      totalRevenue: revenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
    },
    planDistribution: {
      free: planDistribution[0],
      pro: planDistribution[1],
      enterprise: planDistribution[2],
    },
    topUsers: topUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      totalLogs: user._count.logs,
      totalSpent: user.userAnalytics?.totalSpent || 0,
      planType: user.userAnalytics?.planType || "FREE",
    })),
    recentActivity: recentActivity.map((log: any) => ({
      id: log.id,
      type: log.type,
      content: log.content,
      createdAt: log.createdAt,
      user: log.user,
    })),
    creditUsage: {
      totalUsedToday: creditUsage._sum.usedToday || 0,
      totalDailyLimit: creditUsage._sum.dailyLimit || 0,
      averageUsedToday:
        Math.round((creditUsage._avg.usedToday || 0) * 100) / 100,
      averageDailyLimit:
        Math.round((creditUsage._avg.dailyLimit || 0) * 100) / 100,
    },
    integrations: {
      counts: integrationCounts,
      mostPopular: Object.entries(integrationCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5),
    },
    logs: {
      byType: logStatsByType,
      total: Object.values(logStatsByType).reduce(
        (sum: number, count: unknown) => sum + (count as number),
        0
      ),
    },
  };
}
