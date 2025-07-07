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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7"; // days
    const userId = searchParams.get("userId") || user.id;

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get credit usage logs
    const usageLogs = await prisma.log.findMany({
      where: {
        userId,
        type: "INFO",
        content: {
          contains: "Consumed",
        },
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get current credit status
    const credits = await prisma.credit.findUnique({
      where: { userId },
    });

    // Calculate usage statistics
    const usageByDate = usageLogs.reduce(
      (acc: Record<string, number>, log: any) => {
        const date = log.createdAt?.toISOString().split("T")[0] || "";
        const creditMatch = log.content?.match(/Consumed (\d+) credit/);
        const creditsUsed = creditMatch ? parseInt(creditMatch[1]) : 1;
        acc[date] = (acc[date] || 0) + creditsUsed;
        return acc;
      },
      {}
    );

    const totalUsed = Object.values(usageByDate).reduce(
      (sum: number, count: unknown) => sum + (count as number),
      0
    );
    const averageDaily = totalUsed / periodDays;

    const usage = {
      period: {
        days: periodDays,
        startDate,
        endDate: new Date(),
      },
      current: {
        dailyLimit: credits?.dailyLimit || 0,
        usedToday: credits?.usedToday || 0,
        remaining: (credits?.dailyLimit || 0) - (credits?.usedToday || 0),
        lastUpdated: credits?.lastUpdated,
      },
      statistics: {
        totalUsed,
        averageDaily: Math.round(averageDaily * 100) / 100,
        usageByDate,
        recentLogs: usageLogs.slice(0, 10),
      },
    };

    return NextResponse.json({ usage });
  } catch (error) {
    console.error("Error fetching credit usage:", error);
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

    const body = await request.json();
    const { action, amount = 1, description } = body;

    if (action !== "track") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get current credits
    let credits = await prisma.credit.findUnique({
      where: { userId: user.id },
    });

    if (!credits) {
      // Create default credits
      credits = await prisma.credit.create({
        data: {
          userId: user.id,
          dailyLimit: 10,
          usedToday: 0,
          lastUpdated: new Date(),
        },
      });
    }

    // Check if we need to reset daily usage
    const today = new Date();
    const lastUpdated = credits.lastUpdated;

    if (lastUpdated && !isSameDay(today, lastUpdated)) {
      credits = await prisma.credit.update({
        where: { userId: user.id },
        data: {
          usedToday: 0,
          lastUpdated: today,
        },
      });
    }

    // Check if user has enough credits
    const remainingCredits =
      (credits.dailyLimit || 0) - (credits.usedToday || 0);

    if (remainingCredits < amount) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          remaining: remainingCredits,
          required: amount,
        },
        { status: 403 }
      );
    }

    // Update credit usage
    const updatedCredits = await prisma.credit.update({
      where: { userId: user.id },
      data: {
        usedToday: (credits.usedToday || 0) + amount,
        lastUpdated: new Date(),
      },
    });

    // Log the usage
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: description || `Consumed ${amount} credit(s)`,
        isPremium: credits.dailyLimit! > 10,
      },
    });

    // Update user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: user.id },
      update: {
        totalPromptPerDay: (credits.usedToday || 0) + amount,
      },
      create: {
        userId: user.id,
        totalPromptPerDay: amount,
        totalSpent: 0,
        planType: "FREE",
        activeIntegrations: [],
      },
    });

    return NextResponse.json({
      success: true,
      credits: updatedCredits,
      consumed: amount,
      remaining: updatedCredits.dailyLimit! - updatedCredits.usedToday!,
    });
  } catch (error) {
    console.error("Error tracking credit usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
