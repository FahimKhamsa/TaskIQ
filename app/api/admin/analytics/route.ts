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
    const useStored = searchParams.get("useStored") === "true";
    const maxAgeHours = parseInt(searchParams.get("maxAge") || "24");
    const period = searchParams.get("period") || "30";
    const id = searchParams.get("id");

    // If specific ID requested, return that record
    if (id) {
      const analytics = await prisma.adminAnalytics.findUnique({
        where: { id },
      });

      if (!analytics) {
        return NextResponse.json(
          { error: "Analytics record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ analytics });
    }

    // Check for recent stored analytics
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours);

    const recentAnalytics = await prisma.adminAnalytics.findFirst({
      where: {
        createdAt: {
          gte: cutoffTime,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Use stored analytics if available and not too old, or if explicitly requested
    if (useStored && recentAnalytics) {
      return NextResponse.json({ analytics: recentAnalytics });
    }

    // If recent stored analytics exist and user didn't request fresh calculation
    if (recentAnalytics && !searchParams.get("calculate")) {
      return NextResponse.json({ 
        analytics: recentAnalytics,
        isStored: true,
        calculatedAt: recentAnalytics.createdAt
      });
    }

    // Calculate fresh analytics
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const calculatedAnalytics = await calculateAdminAnalytics(startDate);

    return NextResponse.json({ 
      analytics: calculatedAnalytics,
      isStored: false,
      calculatedAt: new Date()
    });
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
    const { period = "30", forceCalculate = false } = body;

    let analyticsData;

    if (forceCalculate || !body.totalUsers) {
      // Calculate fresh analytics
      const periodDays = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const calculated = await calculateAdminAnalytics(startDate);
      analyticsData = mapCalculatedToAdminAnalytics(calculated);
    } else {
      // Use provided data
      const {
        totalUsers,
        topUsers,
        activeIntegrations,
        conversionRate,
        mostUsedCommands,
        recentlyAddedUsers,
      } = body;

      analyticsData = {
        totalUsers,
        topUsers: Array.isArray(topUsers) ? topUsers : [],
        activeIntegrations: Array.isArray(activeIntegrations) ? activeIntegrations : [],
        conversionRate,
        mostUsedCommands: Array.isArray(mostUsedCommands) ? mostUsedCommands : [],
        recentlyAddedUsers: Array.isArray(recentlyAddedUsers) ? recentlyAddedUsers : [],
      };
    }

    // Store analytics in database
    const adminAnalytics = await prisma.adminAnalytics.create({
      data: {
        ...analyticsData,
        createdAt: new Date(),
      },
    });

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Admin created analytics snapshot`,
        isPremium: true,
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

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Analytics ID is required" },
        { status: 400 }
      );
    }

    // Check if analytics record exists
    const existingAnalytics = await prisma.adminAnalytics.findUnique({
      where: { id },
    });

    if (!existingAnalytics) {
      return NextResponse.json(
        { error: "Analytics record not found" },
        { status: 404 }
      );
    }

    // Update analytics
    const updatedAnalytics = await prisma.adminAnalytics.update({
      where: { id },
      data: {
        ...updateData,
        // Don't update createdAt, but we could add updatedAt if needed
      },
    });

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Admin updated analytics record: ${id}`,
        isPremium: true,
      },
    });

    return NextResponse.json({ analytics: updatedAnalytics });
  } catch (error) {
    console.error("Error updating admin analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Analytics ID is required" },
        { status: 400 }
      );
    }

    // Check if analytics record exists
    const existingAnalytics = await prisma.adminAnalytics.findUnique({
      where: { id },
    });

    if (!existingAnalytics) {
      return NextResponse.json(
        { error: "Analytics record not found" },
        { status: 404 }
      );
    }

    // Delete analytics
    await prisma.adminAnalytics.delete({
      where: { id },
    });

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Admin deleted analytics record: ${id}`,
        isPremium: true,
      },
    });

    return NextResponse.json({ message: "Analytics record deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function calculateAdminAnalytics(startDate: Date) {
  try {
    // Get basic user statistics
    const totalUsers = await prisma.user.count().catch(() => 0);
    const newUsersInPeriod = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }).catch(() => 0);

    // Get subscription statistics
    const activeSubscriptions = await prisma.subscription.count({
      where: { isSubscribed: true },
    }).catch(() => 0);

    // Get plan distribution
    const planDistribution = await Promise.all([
      prisma.subscription.count({ where: { plan: "FREE" } }).catch(() => 0),
      prisma.subscription.count({ where: { plan: "MONTHLY" } }).catch(() => 0),
      prisma.subscription.count({ where: { plan: "YEARLY" } }).catch(() => 0),
      prisma.subscription.count({ where: { plan: "BI_YEARLY" } }).catch(() => 0),
    ]);

    // Get top users (simplified)
    const topUsers = await prisma.user.findMany({
      take: 10,
      include: {
        userAnalytics: true,
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 10,
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    // Get credit usage stats
    const creditUsage = await prisma.credit.aggregate({
      _sum: {
        usedToday: true,
        dailyLimit: true,
      },
      _avg: {
        usedToday: true,
        dailyLimit: true,
      },
    }).catch(() => ({
      _sum: { usedToday: 0, dailyLimit: 0 },
      _avg: { usedToday: 0, dailyLimit: 0 }
    }));

    // Get integration statistics
    const integrationStats = await prisma.userAnalytics.findMany({
      select: {
        activeIntegrations: true,
      },
    }).catch(() => []);

    // Get log statistics
    const logStats = await prisma.log.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }).catch(() => []);

    // Calculate revenue (simplified)
    const revenue = activeSubscriptions * 10;

    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;

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
        monthly: planDistribution[1],
        yearly: planDistribution[2],
        bi_yearly: planDistribution[3],
      },
      topUsers: topUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        totalLogs: 0, // Simplified for now
        totalSpent: user.userAnalytics?.totalSpent || 0,
        planType: user.subscription?.plan || "FREE",
      })),
      recentActivity: [], // Simplified for now
      creditUsage: {
        totalUsedToday: creditUsage._sum.usedToday || 0,
        totalDailyLimit: creditUsage._sum.dailyLimit || 0,
        averageUsedToday: Math.round((creditUsage._avg.usedToday || 0) * 100) / 100,
        averageDailyLimit: Math.round((creditUsage._avg.dailyLimit || 0) * 100) / 100,
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
      recentUsers,
    };
  } catch (error) {
    console.error("Error calculating analytics:", error);
    // Return fallback data
    return {
      overview: {
        totalUsers: 0,
        newUsersInPeriod: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        conversionRate: 0,
      },
      planDistribution: {
        free: 0,
        monthly: 0,
        yearly: 0,
        bi_yearly: 0,
      },
      topUsers: [],
      recentActivity: [],
      creditUsage: {
        totalUsedToday: 0,
        totalDailyLimit: 0,
        averageUsedToday: 0,
        averageDailyLimit: 0,
      },
      integrations: {
        counts: {},
        mostPopular: [],
      },
      logs: {
        byType: {},
        total: 0,
      },
      recentUsers: [],
    };
  }
}

function mapCalculatedToAdminAnalytics(calculated: any) {
  return {
    totalUsers: calculated.overview.totalUsers,
    topUsers: calculated.topUsers.map((user: any) => ({
      user: user.fullName || user.email || 'Unknown User',
      prompts: user.totalLogs,
      credits_used: user.userAnalytics?.totalPromptPerDay || 0,
      joined_at: user.createdAt?.toISOString() || new Date().toISOString(),
    })),
    activeIntegrations: calculated.integrations.mostPopular.map(([name]: [string, number]) => name),
    conversionRate: calculated.overview.conversionRate / 100, // Convert to decimal format like in your image
    mostUsedCommands: Object.keys(calculated.logs.byType).slice(0, 5), // Limit to top 5
    recentlyAddedUsers: calculated.recentUsers.map((user: any) => ({
      name: user.fullName || 'Unknown User',
      email: user.email || '',
      joined_at: user.createdAt?.toISOString() || new Date().toISOString(),
      plan: 'FREE' as const, // Default plan, you can enhance this based on subscription data
    })),
  };
}
