import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { telegramUsername, dateOfBirth, phoneNumber } = body;

    // Validate required fields
    if (!telegramUsername || !dateOfBirth) {
      return NextResponse.json(
        { error: "Telegram username and date of birth are required" },
        { status: 400 }
      );
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already registered" },
        { status: 409 }
      );
    }

    // Clean telegram username (remove @ if present)
    const cleanTelegramUsername = telegramUsername.startsWith("@")
      ? telegramUsername.slice(1)
      : telegramUsername;

    // Check if telegram username is already taken
    const existingTelegramUser = await prisma.user.findUnique({
      where: { tgId: cleanTelegramUsername },
    });

    if (existingTelegramUser) {
      return NextResponse.json(
        { error: "Telegram username is already taken" },
        { status: 409 }
      );
    }

    // Parse user metadata from Supabase
    const userMetadata = user.user_metadata || {};
    const fullName = userMetadata.full_name || userMetadata.name || "";
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");
    const email = user.email || "";

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email,
        fullName,
        firstName,
        lastName,
        phone: phoneNumber || null,
        dob: new Date(dateOfBirth),
        tgId: cleanTelegramUsername,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create default credit allocation
    await prisma.credit.create({
      data: {
        userId: newUser.id,
        dailyLimit: 10,
        usedToday: 0,
        lastUpdated: new Date(),
      },
    });

    // Create default subscription
    await prisma.subscription.create({
      data: {
        userId: newUser.id,
        isSubscribed: false,
        plan: "FREE",
        startDate: new Date(),
      },
    });

    // Create user analytics record
    await prisma.userAnalytics.create({
      data: {
        userId: newUser.id,
        totalPromptPerDay: 0,
        totalSpent: 0.0,
        planType: "FREE",
        activeIntegrations: [],
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          telegramUsername: newUser.tgId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
