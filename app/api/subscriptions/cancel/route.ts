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
    const { reason, feedback } = body;

    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!currentSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (currentSubscription.plan === "FREE") {
      return NextResponse.json(
        { error: "Cannot cancel free plan" },
        { status: 400 }
      );
    }

    // Update subscription to FREE plan
    const cancelledSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan: "FREE",
        isSubscribed: false,
        endDate: new Date(), // End immediately
        stripeId: null,
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
    });

    // Reset credit limits to free tier
    await prisma.credit.update({
      where: { userId: user.id },
      data: {
        dailyLimit: 10, // Free tier limit
        usedToday: 0, // Reset usage
        lastUpdated: new Date(),
      },
    });

    // Update user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: user.id },
      update: {
        planType: "FREE",
      },
      create: {
        userId: user.id,
        planType: "FREE",
        totalPromptPerDay: 0,
        totalSpent: 0,
        activeIntegrations: [],
      },
    });

    // Log the cancellation
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Subscription cancelled. Reason: ${reason || "Not specified"}`,
        isPremium: false,
      },
    });

    // TODO: Here you would typically also:
    // 1. Cancel the subscription in Stripe
    // 2. Send cancellation email
    // 3. Store feedback for analysis

    return NextResponse.json({
      success: true,
      subscription: cancelledSubscription,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
