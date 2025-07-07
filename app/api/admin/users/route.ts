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

    // TODO: Add admin role check
    // For now, assume authenticated users can access admin endpoints

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (planFilter) {
      whereClause.subscription = {
        plan: planFilter,
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          subscription: true,
          credit: true,
          userAnalytics: true,
          _count: {
            select: {
              logs: true,
              offerClaims: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Get summary statistics
    const stats = await getUserStats();

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
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

    // TODO: Add admin role check

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        fullName,
        firstName,
        lastName,
        phone,
        dob: dob ? new Date(dob) : null,
        tgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create subscription
    await prisma.subscription.create({
      data: {
        userId: newUser.id,
        plan,
        isSubscribed: plan !== "FREE",
        startDate: new Date(),
      },
    });

    // Create credits
    await prisma.credit.create({
      data: {
        userId: newUser.id,
        dailyLimit,
        usedToday: 0,
        lastUpdated: new Date(),
      },
    });

    // Create user analytics
    await prisma.userAnalytics.create({
      data: {
        userId: newUser.id,
        planType: plan,
        totalPromptPerDay: 0,
        totalSpent: 0,
        activeIntegrations: [],
      },
    });

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Admin created user: ${email}`,
        isPremium: true,
      },
    });

    // Get complete user data
    const completeUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        subscription: true,
        credit: true,
        userAnalytics: true,
      },
    });

    return NextResponse.json({ user: completeUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getUserStats() {
  const [
    totalUsers,
    activeSubscriptions,
    freeUsers,
    proUsers,
    enterpriseUsers,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { isSubscribed: true } }),
    prisma.subscription.count({ where: { plan: "FREE" } }),
    prisma.subscription.count({ where: { plan: "PRO" } }),
    prisma.subscription.count({ where: { plan: "ENTERPRISE" } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalUsers,
    activeSubscriptions,
    planDistribution: {
      free: freeUsers,
      pro: proUsers,
      enterprise: enterpriseUsers,
    },
    recentUsers,
  };
}
