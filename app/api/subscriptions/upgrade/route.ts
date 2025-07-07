import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const { planType, stripeSessionId, paymentIntentId } = body;

    if (!planType) {
      return NextResponse.json(
        { error: "Plan type is required" },
        { status: 400 }
      );
    }

    // Get the pricing for the plan
    const pricing = await prisma.pricing.findUnique({
      where: { planType },
    });

    if (!pricing) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: planType,
        isSubscribed: planType !== "FREE",
        stripeId: stripeSessionId || paymentIntentId,
        startDate: new Date(),
        endDate: getEndDate(planType),
      },
      create: {
        userId: user.id,
        plan: planType,
        isSubscribed: planType !== "FREE",
        stripeId: stripeSessionId || paymentIntentId,
        startDate: new Date(),
        endDate: getEndDate(planType),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        pricing: true,
      },
    });

    // Update credit limits based on plan
    const creditLimits = getCreditLimits(planType);
    await prisma.credit.upsert({
      where: { userId: user.id },
      update: {
        dailyLimit: creditLimits.dailyLimit,
        lastUpdated: new Date(),
      },
      create: {
        userId: user.id,
        dailyLimit: creditLimits.dailyLimit,
        usedToday: 0,
        lastUpdated: new Date(),
      },
    });

    // Update user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: user.id },
      update: {
        planType,
        totalSpent: pricing.price || 0,
      },
      create: {
        userId: user.id,
        planType,
        totalPromptPerDay: 0,
        totalSpent: pricing.price || 0,
        activeIntegrations: [],
      },
    });

    // Log the upgrade
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "SUCCESS",
        content: `Upgraded to ${planType} plan`,
        isPremium: planType !== "FREE",
      },
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: `Successfully upgraded to ${planType} plan`,
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getEndDate(planType: string) {
  const now = new Date();
  switch (planType) {
    case "PRO":
    case "ENTERPRISE":
      // Monthly subscription
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      return endDate;
    case "FREE":
    default:
      return null;
  }
}

function getCreditLimits(planType: string) {
  switch (planType) {
    case "FREE":
      return { dailyLimit: 10 };
    case "PRO":
      return { dailyLimit: 100 };
    case "ENTERPRISE":
      return { dailyLimit: 1000 }; // High limit for enterprise
    default:
      return { dailyLimit: 10 };
  }
}
