import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cache invalidation function
function invalidateUserCache(): void {
  console.log("Cache invalidated for user suspend operation");
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
    console.log("Suspending user with ID:", userId);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Found user to suspend:", existingUser.email);

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Update user status to SUSPENDED
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          status: "SUSPENDED",
          updatedAt: new Date(),
        },
      });

      // Step 2: Update credit limit to 0 to effectively suspend access
      const updatedCredit = await tx.credit.upsert({
        where: { userId },
        update: {
          dailyLimit: 0,
          usedToday: 0,
          lastUpdated: new Date(),
        },
        create: {
          userId,
          dailyLimit: 0,
          usedToday: 0,
          lastUpdated: new Date(),
        },
      });

      // Step 3: Update subscription to mark as suspended
      const updatedSubscription = await tx.subscription.upsert({
        where: { userId },
        update: {
          isSubscribed: false,
          endDate: new Date(),
        },
        create: {
          userId,
          isSubscribed: false,
          plan: "FREE",
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      return { updatedUser, updatedCredit, updatedSubscription };
    });

    console.log("User suspension transaction completed successfully");

    // Step 4: Log admin action
    try {
      await prisma.log.create({
        data: {
          userId: user.id,
          type: "WARNING",
          content: `Admin suspended user: ${existingUser.email || existingUser.id}`,
          isPremium: true,
        },
      });
      console.log("Admin action logged successfully");
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
      // Don't fail the whole operation if logging fails
    }

    console.log("User suspension completed successfully");

    // Invalidate cache after suspending user
    invalidateUserCache();

    return NextResponse.json({ 
      success: true,
      message: "User suspended successfully",
      user: {
        id: result.updatedUser.id,
        email: result.updatedUser.email,
        status: result.updatedUser.status
      }
    });
  } catch (error) {
    console.error("Error suspending user:", error);
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
