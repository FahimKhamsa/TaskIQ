import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// List of emails that can access admin panel
const ADMIN_EMAILS = [
  'charlie.brown@example.com',
  'diana.prince@example.com', 
  'ethan.hunt@example.com',
  'bob.johnson@example.com'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if email is in the allowed admin emails list
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Email not authorized for admin access" },
        { status: 403 }
      );
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: "User account is not active" },
        { status: 403 }
      );
    }

    // Update user role to ADMIN if not already set
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        role: 'ADMIN',
        updatedAt: new Date()
      },
    });

    // Log admin access
    try {
      await prisma.log.create({
        data: {
          userId: user.id,
          type: "INFO",
          content: `Admin access granted to: ${user.email}`,
          isPremium: true,
        },
      });
    } catch (logError) {
      console.error("Failed to log admin access:", logError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.email,
        status: user.status,
        role: 'ADMIN'
      },
      message: "Admin access granted"
    });

  } catch (error) {
    console.error("Error verifying admin user:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
