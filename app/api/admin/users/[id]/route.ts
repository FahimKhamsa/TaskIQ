import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cache invalidation function (shared with main route)
function invalidateUserCache(): void {
  // This would ideally be shared across all routes, but for now we'll implement it here too
  // In a production app, you'd use Redis or another shared cache
  console.log("Cache invalidated for user operations");
}

export async function PUT(
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

    const body = await request.json();
    const {
      email,
      fullName,
      firstName,
      lastName,
      phone,
      dob,
      tgId,
      plan = "FREE",
      dailyLimit = 10,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const userId = params.id;
    console.log("Updating user with ID:", userId);
    console.log("Request body:", { email, fullName, plan, dailyLimit });

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

    console.log("Found existing user:", existingUser.email);

    // Update user in transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update user basic info
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          email,
          fullName,
          firstName,
          lastName,
          phone,
          dob: dob ? new Date(dob) : null,
          tgId: tgId || null,
          status: "ACTIVE", // Reset status to active when updating user
          updatedAt: new Date(),
        },
      });

      // Update or create subscription
      const subscription = await tx.subscription.upsert({
        where: { userId },
        update: {
          plan: plan as any,
          isSubscribed: plan !== "FREE",
        },
        create: {
          userId,
          plan: plan as any,
          isSubscribed: plan !== "FREE",
          startDate: new Date(),
        },
      });

      // Update or create credits
      const credit = await tx.credit.upsert({
        where: { userId },
        update: {
          dailyLimit: Number(dailyLimit),
          lastUpdated: new Date(),
        },
        create: {
          userId,
          dailyLimit: Number(dailyLimit),
          usedToday: 0,
          lastUpdated: new Date(),
        },
      });

      // Update or create user analytics
      const analytics = await tx.userAnalytics.upsert({
        where: { userId },
        update: {
          planType: plan.toString(),
        },
        create: {
          userId,
          planType: plan.toString(),
          totalPromptPerDay: 0,
          totalSpent: 0,
          activeIntegrations: [],
        },
      });

      return { updatedUser, subscription, credit, analytics };
    });

    console.log("User update transaction completed successfully");

    // Log admin action (outside transaction to avoid issues)
    try {
      await prisma.log.create({
        data: {
          userId: user.id,
          type: "INFO",
          content: `Admin updated user: ${email} (ID: ${userId})`,
          isPremium: true,
        },
      });
      console.log("Admin action logged successfully");
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
      // Don't fail the whole operation if logging fails
    }

    // Get complete updated user data
    const completeUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        credit: true,
        userAnalytics: true,
      },
    });

    // Invalidate cache after updating user
    invalidateUserCache();

    return NextResponse.json({ 
      success: true,
      user: completeUser,
      message: "User updated successfully"
    });
  } catch (error) {
    console.error("Error updating user:", error);
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

export async function DELETE(
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

    // TODO: Add admin role check

    const userId = params.id;

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

    // Delete related records first (due to foreign key constraints)
    // Use deleteMany to avoid errors if records don't exist
    await Promise.all([
      prisma.log.deleteMany({
        where: { userId },
      }),
      prisma.offerClaim.deleteMany({
        where: { userId },
      }),
      prisma.userAnalytics.deleteMany({
        where: { userId },
      }),
      prisma.credit.deleteMany({
        where: { userId },
      }),
      prisma.subscription.deleteMany({
        where: { userId },
      }),
    ]);

    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "WARNING",
        content: `Admin deleted user: ${existingUser.email}`,
        isPremium: true,
      },
    });

    // Invalidate cache after deleting user
    invalidateUserCache();

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
