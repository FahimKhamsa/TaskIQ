import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Add admin role check

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type") || "";
    const userId = searchParams.get("userId") || "";
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

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

    const [logs, total, overallStats] = await Promise.all([
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
    const filteredStats = await prisma.log.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
      where: whereClause,
    });

    const logStats = overallStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.type || "UNKNOWN"] = stat._count.type;
      return acc;
    }, {});

    const filteredLogStats = filteredStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.type || "UNKNOWN"] = stat._count.type;
      return acc;
    }, {});

    // Transform logs to include formatted data
    const transformedLogs = logs.map(log => ({
      ...log,
      // Format the log type for display
      displayType: log.type || 'UNKNOWN',
      // Get user display name
      userDisplay: log.user?.fullName || log.user?.email || 'System',
      // Format timestamp
      formattedTime: log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Unknown',
      // Determine if it's a premium action
      isPremiumAction: log.isPremium || false,
    }));

    return NextResponse.json({
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
        total: overallStats.reduce((sum, stat) => sum + stat._count.type, 0),
        filteredTotal: total,
      },
    });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
