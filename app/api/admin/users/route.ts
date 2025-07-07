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
      whereClause.userAnalytics = {
        planType: planFilter,
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

    // Transform users data to include analytics information
    const transformedUsers = users.map(user => ({
      ...user,
      // Calculate status based on last activity and analytics
      status: calculateUserStatus(user),
      // Get plan from userAnalytics if available, fallback to subscription
      planType: user.userAnalytics?.planType || user.subscription?.plan || 'FREE',
      // Get analytics data
      totalPrompts: user.userAnalytics?.totalPromptPerDay || 0,
      totalSpent: user.userAnalytics?.totalSpent || 0,
      activeIntegrations: user.userAnalytics?.activeIntegrations || [],
      // Calculate remaining credits
      remainingCredits: (user.credit?.dailyLimit || 0) - (user.credit?.usedToday || 0),
    }));

    // Get summary statistics
    const stats = await getUserStats();

    return NextResponse.json({
      users: transformedUsers,
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

// Helper function to calculate user status
function calculateUserStatus(user: any) {
  if (!user.userAnalytics) return 'inactive';
  
  const now = new Date();
  const lastActivity = user.updatedAt ? new Date(user.updatedAt) : null;
  
  if (!lastActivity) return 'inactive';
  
  const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  // Consider user active if they've been active in the last 7 days
  if (daysSinceActivity <= 7) return 'active';
  if (daysSinceActivity <= 30) return 'inactive';
  
  return 'suspended';
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
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    freeUsers,
    proUsers,
    enterpriseUsers,
    recentUsers,
    totalSpent,
    totalPrompts,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Active users (updated in last 7 days)
    prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Inactive users (updated 7-30 days ago)
    prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Suspended users (not updated in 30+ days)
    prisma.user.count({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Plan distribution from UserAnalytics
    prisma.userAnalytics.count({ where: { planType: "FREE" } }),
    prisma.userAnalytics.count({ where: { planType: "PRO" } }),
    prisma.userAnalytics.count({ where: { planType: "ENTERPRISE" } }),
    
    // Recent users with analytics
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        userAnalytics: true,
      },
    }),
    
    // Total spent across all users
    prisma.userAnalytics.aggregate({
      _sum: {
        totalSpent: true,
      },
    }),
    
    // Total prompts across all users
    prisma.userAnalytics.aggregate({
      _sum: {
        totalPromptPerDay: true,
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    planDistribution: {
      free: freeUsers,
      pro: proUsers,
      enterprise: enterpriseUsers,
    },
    recentUsers: recentUsers.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      planType: user.userAnalytics?.planType || 'FREE',
      totalSpent: user.userAnalytics?.totalSpent || 0,
    })),
    totalSpent: totalSpent._sum.totalSpent || 0,
    totalPrompts: totalPrompts._sum.totalPromptPerDay || 0,
  };
}
