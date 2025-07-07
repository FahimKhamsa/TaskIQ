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

    // TODO: Add admin role check

    const { id } = params;

    const userData = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        credit: true,
        userAnalytics: true,
        logs: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
        googleTokens: true,
        offerClaims: {
          include: {
            offer: true,
          },
        },
        _count: {
          select: {
            logs: true,
            offerClaims: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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

    // TODO: Add admin role check

    const { id } = params;
    const body = await request.json();
    const {
      fullName,
      firstName,
      lastName,
      phone,
      dob,
      tgId,
      plan,
      dailyLimit,
      isSubscribed,
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        firstName,
        lastName,
        phone,
        dob: dob ? new Date(dob) : null,
        tgId,
        updatedAt: new Date(),
      },
    });

    // Update subscription if plan is provided
    if (plan !== undefined) {
      await prisma.subscription.upsert({
        where: { userId: id },
        update: {
          plan,
          isSubscribed:
            isSubscribed !== undefined ? isSubscribed : plan !== "FREE",
        },
        create: {
          userId: id,
          plan,
          isSubscribed:
            isSubscribed !== undefined ? isSubscribed : plan !== "FREE",
          startDate: new Date(),
        },
      });
    }

    // Update credits if dailyLimit is provided
    if (dailyLimit !== undefined) {
      await prisma.credit.upsert({
        where: { userId: id },
        update: {
          dailyLimit,
          lastUpdated: new Date(),
        },
        create: {
          userId: id,
          dailyLimit,
          usedToday: 0,
          lastUpdated: new Date(),
        },
      });
    }

    // Update user analytics if plan is provided
    if (plan !== undefined) {
      await prisma.userAnalytics.upsert({
        where: { userId: id },
        update: {
          planType: plan,
        },
        create: {
          userId: id,
          planType: plan,
          totalPromptPerDay: 0,
          totalSpent: 0,
          activeIntegrations: [],
        },
      });
    }

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Admin updated user: ${existingUser.email}`,
        isPremium: true,
      },
    });

    // Get updated user data
    const completeUser = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        credit: true,
        userAnalytics: true,
      },
    });

    return NextResponse.json({ user: completeUser });
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Log admin action before deletion
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "WARNING",
        content: `Admin deleted user: ${existingUser.email}`,
        isPremium: true,
      },
    });

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
