import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ session: null, user: null });
    }

    // Get user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
        credit: true,
      },
    });

    return NextResponse.json({
      session: { user },
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    const supabase = createClient();

    if (action === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ user: data.user, session: data.session });
    }

    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create user record in database if signup successful
      if (data.user) {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: {
            email: data.user.email,
            updatedAt: new Date(),
          },
          create: {
            id: data.user.id,
            email: data.user.email,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Create default credit allocation
        await prisma.credit.create({
          data: {
            userId: data.user.id,
            dailyLimit: 10, // Default daily limit for free users
            usedToday: 0,
            lastUpdated: new Date(),
          },
        });

        // Create default subscription
        await prisma.subscription.create({
          data: {
            userId: data.user.id,
            isSubscribed: false,
            plan: "FREE",
            startDate: new Date(),
          },
        });
      }

      return NextResponse.json({ user: data.user, session: data.session });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in session management:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error signing out:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
