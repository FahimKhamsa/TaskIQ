import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createUnauthorizedResponse } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = verifyAdminAuth(request);
    if (!adminUser) {
      return createUnauthorizedResponse();
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

    // System memory and CPU check
    let systemStatus = "healthy";
    let systemResponseTime = 0;
    try {
      const systemStart = Date.now();
      const memoryUsage = process.memoryUsage();
      systemResponseTime = Date.now() - systemStart;
      
      // Check if memory usage is reasonable (less than 1GB)
      if (memoryUsage.heapUsed > 1024 * 1024 * 1024) {
        systemStatus = "warning";
      }
    } catch (error) {
      systemStatus = "unhealthy";
      console.error("System health check failed:", error);
    }

    // Get system metrics
    const [userCount, logCount, subscriptionCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.log.count().catch(() => 0),
      prisma.subscription.count().catch(() => 0),
    ]);

    const totalResponseTime = Date.now() - startTime;
    const overallStatus =
      dbStatus === "healthy" && systemStatus !== "unhealthy"
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
        system: {
          status: systemStatus,
          responseTime: systemResponseTime,
          memoryUsage: process.memoryUsage(),
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
