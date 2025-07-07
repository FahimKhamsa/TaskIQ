import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    // Check if user exists
    const userData = await prisma.user.findUnique({
      where: { id },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get user analytics
    const userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId: id },
    });

    // Get logs for the period
    const logs = await prisma.log.findMany({
      where: {
        userId: id,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get credit usage for the period
    const creditUsage = await prisma.credit.findUnique({
      where: { userId: id },
    });

    // Calculate analytics
    const logsByType = logs.reduce((acc: Record<string, number>, log: any) => {
      const type = log.type || "INFO";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const logsByDate = logs.reduce((acc: Record<string, number>, log: any) => {
      const date = log.createdAt?.toISOString().split("T")[0] || "";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const analytics = {
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        createdAt: userData.createdAt,
      },
      period: {
        days: periodDays,
        startDate,
        endDate: new Date(),
      },
      summary: {
        totalLogs: logs.length,
        totalSpent: userAnalytics?.totalSpent || 0,
        planType: userAnalytics?.planType || "FREE",
        activeIntegrations: userAnalytics?.activeIntegrations || [],
        dailyLimit: creditUsage?.dailyLimit || 0,
        usedToday: creditUsage?.usedToday || 0,
      },
      breakdown: {
        logsByType,
        logsByDate,
        recentLogs: logs.slice(0, 10),
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
