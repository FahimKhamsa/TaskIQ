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
    const userId = searchParams.get("userId");

    if (userId) {
      // Get specific user's credits (admin only)
      const credits = await prisma.credit.findUnique({
        where: { userId },
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

      return NextResponse.json({ credits });
    }

    // Get current user's credits
    const credits = await prisma.credit.findUnique({
      where: { userId: user.id },
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

    if (!credits) {
      // Create default credits if not exists
      const newCredits = await prisma.credit.create({
        data: {
          userId: user.id,
          dailyLimit: 10,
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

      return NextResponse.json({ credits: newCredits });
    }

    // Check if we need to reset daily usage
    const today = new Date();
    const lastUpdated = credits.lastUpdated;

    if (lastUpdated && !isSameDay(today, lastUpdated)) {
      // Reset daily usage
      const updatedCredits = await prisma.credit.update({
        where: { userId: user.id },
        data: {
          usedToday: 0,
          lastUpdated: today,
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

      return NextResponse.json({ credits: updatedCredits });
    }

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Error fetching credits:", error);
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
    const { action, amount = 1 } = body;

    if (action !== "consume" && action !== "add") {
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

    if (action === "consume") {
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

      // Consume credits
      const updatedCredits = await prisma.credit.update({
        where: { userId: user.id },
        data: {
          usedToday: (credits.usedToday || 0) + amount,
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

      // Log credit usage
      await prisma.log.create({
        data: {
          userId: user.id,
          type: "INFO",
          content: `Consumed ${amount} credit(s)`,
          isPremium: credits.dailyLimit! > 10,
        },
      });

      return NextResponse.json({
        credits: updatedCredits,
        consumed: amount,
        remaining: updatedCredits.dailyLimit! - updatedCredits.usedToday!,
      });
    }

    if (action === "add") {
      // Add credits (admin only or bonus credits)
      const updatedCredits = await prisma.credit.update({
        where: { userId: user.id },
        data: {
          dailyLimit: (credits.dailyLimit || 0) + amount,
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

      // Log credit addition
      await prisma.log.create({
        data: {
          userId: user.id,
          type: "SUCCESS",
          content: `Added ${amount} credit(s) to daily limit`,
          isPremium: true,
        },
      });

      return NextResponse.json({
        credits: updatedCredits,
        added: amount,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing credits:", error);
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
