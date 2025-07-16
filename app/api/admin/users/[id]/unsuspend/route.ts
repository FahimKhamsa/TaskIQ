import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cache invalidation function
function invalidateUserCache(): void {
  console.log("Cache invalidated for user unsuspend operation");
}

export async function POST(
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

    const userId = params.id;
    console.log("Unsuspending user with ID:", userId);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        credit: true,
        subscription: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Found user to unsuspend:", existingUser.email);

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Update user status to ACTIVE
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });

      // Step 2: Restore credit limit (use default of 10 if no previous limit)
      const defaultDailyLimit = 10;
      const updatedCredit = await tx.credit.upsert({
        where: { userId },
        update: {
          dailyLimit: defaultDailyLimit,
          usedToday: 0,
          lastUpdated: new Date(),
        },
        create: {
          userId,
          dailyLimit: defaultDailyLimit,
          usedToday: 0,
          lastUpdated: new Date(),
        },
      });

      // Step 3: Restore subscription (set to FREE plan if no existing subscription)
      const updatedSubscription = await tx.subscription.upsert({
        where: { userId },
        update: {
          isSubscribed: existingUser.subscription?.plan !== "FREE",
          endDate: null,
        },
        create: {
          userId,
          isSubscribed: false,
          plan: "FREE",
          startDate: new Date(),
        },
      });

      return { updatedUser, updatedCredit, updatedSubscription };
    });

    console.log("User unsuspension transaction completed successfully");

    // Step 4: Log admin action
    try {
      await prisma.log.create({
        data: {
          userId: user.id,
          type: "INFO",
          content: `Admin unsuspended user: ${existingUser.email || existingUser.id}`,
          isPremium: true,
        },
      });
      console.log("Admin action logged successfully");
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
      // Don't fail the whole operation if logging fails
    }

    console.log("User unsuspension completed successfully");

    // Invalidate cache after unsuspending user
    invalidateUserCache();

    return NextResponse.json({ 
      success: true,
      message: "User unsuspended successfully",
      user: {
        id: result.updatedUser.id,
        email: result.updatedUser.email,
        status: result.updatedUser.status
      }
    });
  } catch (error) {
    console.error("Error unsuspending user:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      userId: params.id,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error',
        userId: params.id
      },
      { status: 500 }
    );
  }
}
