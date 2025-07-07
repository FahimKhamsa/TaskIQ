import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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

    const startTime = Date.now();

    // Check database connectivity
    let dbStatus = "healthy";
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = "unhealthy";
      console.error("Database health check failed:", error);
    }

    // Check Supabase connectivity
    let supabaseStatus = "healthy";
    let supabaseResponseTime = 0;
    try {
      const supabaseStart = Date.now();
      await supabase.auth.getSession();
      supabaseResponseTime = Date.now() - supabaseStart;
    } catch (error) {
      supabaseStatus = "unhealthy";
      console.error("Supabase health check failed:", error);
    }

    // Get system metrics
    const [userCount, logCount, subscriptionCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.log.count().catch(() => 0),
      prisma.subscription.count().catch(() => 0),
    ]);

    const totalResponseTime = Date.now() - startTime;
    const overallStatus =
      dbStatus === "healthy" && supabaseStatus === "healthy"
        ? "healthy"
        : "unhealthy";

    const healthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalResponseTime,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        supabase: {
          status: supabaseStatus,
          responseTime: supabaseResponseTime,
        },
      },
      metrics: {
        totalUsers: userCount,
        totalLogs: logCount,
        totalSubscriptions: subscriptionCount,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    const statusCode = overallStatus === "healthy" ? 200 : 503;
    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}
