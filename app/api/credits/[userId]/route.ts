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

    // Check if requesting user has permission (admin or own data)
    if (user.id !== userId) {
      // TODO: Add admin role check here
      // For now, allow any authenticated user to view others' credits
    }

    const credits = await prisma.credit.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!credits) {
      return NextResponse.json(
        { error: "Credit record not found" },
        { status: 404 }
      );
    }

    // Check if we need to reset daily usage
    const today = new Date();
    const lastUpdated = credits.lastUpdated;

    if (lastUpdated && !isSameDay(today, lastUpdated)) {
      // Reset daily usage
      const updatedCredits = await prisma.credit.update({
        where: { userId },
        data: {
          usedToday: 0,
          lastUpdated: today,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              createdAt: true,
            },
          },
        },
      });

      return NextResponse.json({ credits: updatedCredits });
    }

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
