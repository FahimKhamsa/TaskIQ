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
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";

    // Build where clause (same as main users endpoint)
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

    // Get all users matching the criteria (no pagination for export)
    const users = await prisma.user.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
    });

    // Transform users data for CSV export
    const csvData = users.map(user => {
      const status = calculateUserStatus(user);
      const planType = user.userAnalytics?.planType || user.subscription?.plan || 'FREE';
      const totalPrompts = user.userAnalytics?.totalPromptPerDay || 0;
      const totalSpent = user.userAnalytics?.totalSpent || 0;
      const remainingCredits = (user.credit?.dailyLimit || 0) - (user.credit?.usedToday || 0);
      const activeIntegrations = user.userAnalytics?.activeIntegrations || [];

      return {
        'User ID': user.id,
        'Full Name': user.fullName || '',
        'Email': user.email,
        'Phone': user.phone || '',
        'Plan': planType,
        'Status': status,
        'Total Prompts/Day': totalPrompts,
        'Total Spent': totalSpent.toFixed(2),
        'Daily Credit Limit': user.credit?.dailyLimit || 0,
        'Credits Used Today': user.credit?.usedToday || 0,
        'Remaining Credits': remainingCredits,
        'Active Integrations': activeIntegrations.join(', '),
        'Total Logs': user._count.logs,
        'Offer Claims': user._count.offerClaims,
        'Joined Date': user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        'Last Updated': user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : '',
        'Telegram ID': user.tgId || '',
        'Date of Birth': user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      };
    });

    // Convert to CSV format
    if (csvData.length === 0) {
      return new NextResponse('No data to export', { status: 404 });
    }

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Log admin action
    await prisma.log.create({
      data: {
        userId: user.id,
        type: "INFO",
        content: `Admin exported ${csvData.length} users to CSV`,
        isPremium: true,
      },
    });

    const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate user status (same as main route)
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
