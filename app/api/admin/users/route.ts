import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCacheKey(page: number, limit: number, search: string, planFilter: string, sortBy: string, sortOrder: string): string {
  return `users:${page}:${limit}:${search}:${planFilter}:${sortBy}:${sortOrder}`;
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMs: number = 60000): void { // Default 1 minute TTL
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

function invalidateUserCache(): void {
  // Clear all user-related cache entries
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.startsWith('users:') || key.startsWith('stats:')) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cache.delete(key));
}

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

    console.log("Fetching admin users for user:", user.id);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const forceRefresh = searchParams.get("refresh") === "true";

    const skip = (page - 1) * limit;

    console.log("Query parameters:", { page, limit, search, planFilter, sortBy, sortOrder, forceRefresh });

    // Check cache first (unless force refresh is requested)
    const cacheKey = getCacheKey(page, limit, search, planFilter, sortBy, sortOrder);
    if (!forceRefresh) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        console.log("Returning cached data for:", cacheKey);
        return NextResponse.json({
          ...cachedData,
          cached: true,
          cacheTimestamp: Date.now()
        });
      }
    }

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

    console.log("Where clause:", JSON.stringify(whereClause, null, 2));

    // Fetch users with their related data
    let users, total;
    try {
      [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            subscription: true,
            credit: true,
            userAnalytics: true,
          },
        }),
        prisma.user.count({ where: whereClause }),
      ]);
      console.log(`Found ${users.length} users out of ${total} total`);
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json(
        { 
          error: "Database query failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error"
        },
        { status: 500 }
      );
    }

    // Transform users data with real database values
    const transformedUsers = users.map(user => {
      try {
        // Determine user status based on database status and activity
        let userStatus = user.status?.toLowerCase() || 'active';
        
        // If user has no credits and status is not explicitly suspended, mark as inactive
        if (userStatus === 'active' && user.credit && user.credit.dailyLimit === 0) {
          userStatus = 'inactive';
        }

        return {
          id: user.id,
          email: user.email || '',
          fullName: user.fullName || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          tgId: user.tgId || '',
          dob: user.dob,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          status: userStatus,
          planType: user.subscription?.plan || 'FREE',
          totalPrompts: user.userAnalytics?.totalPromptPerDay || 0,
          totalSpent: user.userAnalytics?.totalSpent || 0,
          activeIntegrations: user.userAnalytics?.activeIntegrations || [],
          remainingCredits: user.credit ? ((user.credit.dailyLimit || 0) - (user.credit.usedToday || 0)) : 0,
          credit: user.credit,
        };
      } catch (transformError) {
        console.error("Error transforming user:", user.id, transformError);
        return {
          id: user.id,
          email: user.email || '',
          fullName: user.fullName || 'Unknown User',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          tgId: user.tgId || '',
          dob: user.dob,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          status: 'inactive',
          planType: 'FREE',
          totalPrompts: 0,
          totalSpent: 0,
          activeIntegrations: [],
          remainingCredits: 0,
          credit: null,
        };
      }
    });

    // Calculate real stats from database with fallback
    let statusCounts: any[] = [];
    let planCounts: any[] = [];
    
    try {
      [statusCounts, planCounts] = await Promise.all([
        prisma.user.groupBy({
          by: ['status'],
          _count: {
            status: true,
          },
        }).catch(() => []), // Fallback to empty array if groupBy fails
        prisma.subscription.groupBy({
          by: ['plan'],
          _count: {
            plan: true,
          },
        }).catch(() => []), // Fallback to empty array if groupBy fails
      ]);
    } catch (error) {
      console.error("Error calculating stats:", error);
      // Use fallback calculations based on transformed users
    }

    // Process status counts with fallback
    let statusMap: Record<string, number> = {};
    if (statusCounts.length > 0) {
      statusMap = statusCounts.reduce((acc, item) => {
        acc[item.status?.toLowerCase() || 'active'] = item._count.status;
        return acc;
      }, {} as Record<string, number>);
    } else {
      // Fallback: calculate from transformed users
      statusMap = transformedUsers.reduce((acc, user) => {
        const status = user.status || 'active';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }

    // Process plan counts with fallback
    let planMap: Record<string, number> = {};
    if (planCounts.length > 0) {
      planMap = planCounts.reduce((acc, item) => {
        acc[item.plan?.toLowerCase() || 'free'] = item._count.plan;
        return acc;
      }, {} as Record<string, number>);
    } else {
      // Fallback: calculate from transformed users
      planMap = transformedUsers.reduce((acc, user) => {
        const plan = user.planType?.toLowerCase() || 'free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }

    const stats = {
      totalUsers: total,
      activeUsers: statusMap.active || 0,
      inactiveUsers: statusMap.inactive || 0,
      suspendedUsers: statusMap.suspended || 0,
      planDistribution: {
        free: planMap.free || 0,
        monthly: planMap.monthly || 0,
        yearly: planMap.yearly || 0,
        bi_yearly: planMap.bi_yearly || 0,
      },
      recentUsers: transformedUsers.slice(0, 5).map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        planType: user.planType,
        totalSpent: user.totalSpent,
      })),
      totalSpent: transformedUsers.reduce((sum, user) => sum + user.totalSpent, 0),
      totalPrompts: transformedUsers.reduce((sum, user) => sum + user.totalPrompts, 0),
    };

    const response = {
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
      cached: false,
      timestamp: Date.now()
    };

    // Cache the response (shorter TTL for search results, longer for regular queries)
    const ttl = search || planFilter ? 30000 : 120000; // 30s for filtered, 2min for regular
    setCache(cacheKey, response, ttl);

    console.log("Returning fresh data with", transformedUsers.length, "users");
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
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

    console.log("Creating new user by admin:", user.id);

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

    console.log("Creating user with data:", { email, fullName, plan, dailyLimit });

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

    // Create user with transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Create user
        console.log("Creating user with ID:", randomUUID());
        const newUser = await tx.user.create({
          data: {
            id: randomUUID(),
            email,
            fullName: fullName || null,
            firstName: firstName || null,
            lastName: lastName || null,
            phone: phone || null,
            dob: dob ? new Date(dob) : null,
            tgId: tgId || null,
            status: "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log("User created:", newUser.id);

        // Create subscription
        console.log("Creating subscription for user:", newUser.id);
        const subscription = await tx.subscription.create({
          data: {
            userId: newUser.id,
            plan: plan,
            isSubscribed: plan !== "FREE",
            startDate: new Date(),
          },
        });
        console.log("Subscription created:", subscription.id);

        // Create credits
        console.log("Creating credits for user:", newUser.id);
        const credit = await tx.credit.create({
          data: {
            userId: newUser.id,
            dailyLimit: Number(dailyLimit) || 10,
            usedToday: 0,
            lastUpdated: new Date(),
          },
        });
        console.log("Credits created:", credit.id);

        // Create user analytics
        console.log("Creating analytics for user:", newUser.id);
        const analytics = await tx.userAnalytics.create({
          data: {
            userId: newUser.id,
            planType: plan.toString(),
            totalPromptPerDay: 0,
            totalSpent: 0,
            activeIntegrations: [],
          },
        });
        console.log("Analytics created:", analytics.id);

        return { newUser, subscription, credit, analytics };
      } catch (txError) {
        console.error("Transaction error:", txError);
        throw txError;
      }
    });

    console.log("User created successfully:", result.newUser.id);

    // Log admin action (outside transaction)
    try {
      await prisma.log.create({
        data: {
          userId: user.id,
          type: "INFO",
          content: `Admin created user: ${email}`,
          isPremium: true,
        },
      });
      console.log("Admin action logged successfully");
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
    }

    // Get complete user data
    const completeUser = await prisma.user.findUnique({
      where: { id: result.newUser.id },
      include: {
        subscription: true,
        credit: true,
        userAnalytics: true,
      },
    });

    // Invalidate cache after creating user
    invalidateUserCache();

    return NextResponse.json({ 
      success: true,
      user: completeUser,
      message: "User created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin user:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
