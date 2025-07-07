import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";

    // Check if requesting user has permission (admin or own data)
    if (user.id !== userId) {
      // TODO: Add admin role check here
      // For now, allow any authenticated user to view others' logs
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userId,
    };

    if (type) {
      whereClause.type = type;
    }

    if (search) {
      whereClause.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [logs, total] = await Promise.all([
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
    ]);

    // Get log statistics for this user
    const stats = await prisma.log.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
      where: { userId },
    });

    const logStats = stats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.type || "UNKNOWN"] = stat._count.type;
      return acc;
    }, {});

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: logStats,
    });
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
