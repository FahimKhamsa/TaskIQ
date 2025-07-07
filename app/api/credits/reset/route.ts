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
    const { resetType = "daily" } = body;

    // Get current credits
    const credits = await prisma.credit.findUnique({
      where: { userId: user.id },
    });

    if (!credits) {
      return NextResponse.json(
        { error: "No credit record found" },
        { status: 404 }
      );
    }

    let updatedCredits;

    switch (resetType) {
      case "daily":
        // Reset daily usage
        updatedCredits = await prisma.credit.update({
          where: { userId: user.id },
          data: {
            usedToday: 0,
            lastUpdated: new Date(),
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

        // Log the reset
        await prisma.log.create({
          data: {
            userId: user.id,
            type: "INFO",
            content: "Daily credit usage reset",
            isPremium: credits.dailyLimit! > 10,
          },
        });

        break;

      case "limit":
        // Reset to default limit based on subscription
        const subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        });

        let newLimit = 10; // Default free limit
        if (subscription?.plan === "PRO") {
          newLimit = 100;
        } else if (subscription?.plan === "ENTERPRISE") {
          newLimit = 1000;
        }

        updatedCredits = await prisma.credit.update({
          where: { userId: user.id },
          data: {
            dailyLimit: newLimit,
            usedToday: 0,
            lastUpdated: new Date(),
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

        // Log the reset
        await prisma.log.create({
          data: {
            userId: user.id,
            type: "INFO",
            content: `Credit limit reset to ${newLimit} based on ${
              subscription?.plan || "FREE"
            } plan`,
            isPremium: newLimit > 10,
          },
        });

        break;

      default:
        return NextResponse.json(
          { error: "Invalid reset type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      credits: updatedCredits,
      resetType,
      message: `Credits ${resetType} reset successfully`,
    });
  } catch (error) {
    console.error("Error resetting credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
