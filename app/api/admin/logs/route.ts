import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for logs
const logsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getLogsCacheKey(page: number, limit: number, filters: any): string {
  return `logs:${page}:${limit}:${JSON.stringify(filters)}`;
}

function getFromLogsCache(key: string): any | null {
  const cached = logsCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  logsCache.delete(key);
  return null;
}

function setLogsCache(key: string, data: any, ttlMs: number = 30000): void { // Default 30 seconds TTL
  logsCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

function invalidateLogsCache(): void {
  // Clear all logs cache entries
  const keysToDelete: string[] = [];
  logsCache.forEach((_, key) => {
    if (key.startsWith('logs:')) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => logsCache.delete(key));
}

// POST - Create a new log entry
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
    const { userId, type, content, isPremium } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    const newLog = await prisma.log.create({
      data: {
        userId: userId || null,
        type,
        content,
        isPremium: isPremium || false,
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

    const transformedLog = {
      ...newLog,
      displayType: newLog.type || 'UNKNOWN',
      userDisplay: newLog.user?.fullName || newLog.user?.email || 'System',
      formattedTime: newLog.createdAt ? new Date(newLog.createdAt).toLocaleString() : 'Unknown',
      isPremiumAction: newLog.isPremium || false,
    };

    // Invalidate cache after creating log
    invalidateLogsCache();

    return NextResponse.json({ log: transformedLog }, { status: 201 });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a log entry
export async function PUT(request: NextRequest) {
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
    const { id, type, content, isPremium } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }

    const updatedLog = await prisma.log.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(content && { content }),
        ...(isPremium !== undefined && { isPremium }),
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

    const transformedLog = {
      ...updatedLog,
      displayType: updatedLog.type || 'UNKNOWN',
      userDisplay: updatedLog.user?.fullName || updatedLog.user?.email || 'System',
      formattedTime: updatedLog.createdAt ? new Date(updatedLog.createdAt).toLocaleString() : 'Unknown',
      isPremiumAction: updatedLog.isPremium || false,
    };

    // Invalidate cache after updating log
    invalidateLogsCache();

    return NextResponse.json({ log: transformedLog });
  } catch (error) {
    console.error("Error updating log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a log entry
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }

    await prisma.log.delete({
      where: { id },
    });

    // Invalidate cache after deleting log
    invalidateLogsCache();

    return NextResponse.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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

    console.log("Fetching admin logs for user:", user.id);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type") || "";
    const userId = searchParams.get("userId") || "";
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const forceRefresh = searchParams.get("refresh") === "true";

    const skip = (page - 1) * limit;

    // Build filters object for caching
    const filters = { type, userId, search, startDate, endDate };
    const cacheKey = getLogsCacheKey(page, limit, filters);

    console.log("Query parameters:", { page, limit, filters, forceRefresh });

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedData = getFromLogsCache(cacheKey);
      if (cachedData) {
        console.log("Returning cached logs data for:", cacheKey);
        return NextResponse.json({
          ...cachedData,
          cached: true,
          cacheTimestamp: Date.now()
        });
      }
    }

    // Build where clause
    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (search) {
      whereClause.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    console.log("Where clause:", JSON.stringify(whereClause, null, 2));

    let logs, total, overallStats, filteredStats;
    try {
      [logs, total, overallStats] = await Promise.all([
        prisma.log.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.log.count({ where: whereClause }),
        // Get overall statistics for all logs (not just filtered)
        prisma.log.groupBy({
          by: ["type"],
          _count: {
            type: true,
          },
        }),
      ]);

      // Get filtered statistics
      filteredStats = await prisma.log.groupBy({
        by: ["type"],
        _count: {
          type: true,
        },
        where: whereClause,
      });

      console.log(`Found ${logs.length} logs out of ${total} total`);
      console.log("Overall stats:", overallStats);
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

    // Process stats with proper fallbacks
    const logStats = overallStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.type || "UNKNOWN"] = stat._count.type;
      return acc;
    }, {});

    const filteredLogStats = filteredStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.type || "UNKNOWN"] = stat._count.type;
      return acc;
    }, {});

    // Calculate total logs properly
    const totalLogs = overallStats.reduce((sum, stat) => sum + stat._count.type, 0);

    // Transform logs to include formatted data
    const transformedLogs = logs.map(log => {
      try {
        return {
          ...log,
          // Format the log type for display
          displayType: log.type || 'UNKNOWN',
          // Get user display name
          userDisplay: log.user?.fullName || log.user?.email || 'System',
          // Format timestamp
          formattedTime: log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Unknown',
          // Determine if it's a premium action
          isPremiumAction: log.isPremium || false,
        };
      } catch (transformError) {
        console.error("Error transforming log:", log.id, transformError);
        return {
          ...log,
          displayType: 'UNKNOWN',
          userDisplay: 'System',
          formattedTime: 'Unknown',
          isPremiumAction: false,
        };
      }
    });

    const response = {
      logs: transformedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        overall: logStats,
        filtered: filteredLogStats,
        total: totalLogs,
        filteredTotal: total,
      },
      cached: false,
      timestamp: Date.now()
    };

    // Cache the response (shorter TTL for search results, longer for regular queries)
    const ttl = search || type || userId ? 15000 : 30000; // 15s for filtered, 30s for regular
    setLogsCache(cacheKey, response, ttl);

    console.log("Returning fresh logs data with", transformedLogs.length, "logs, total:", totalLogs);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin logs:", error);
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
