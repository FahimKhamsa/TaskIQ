import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tgId, tempKey, action } = body;

    if (!tgId) {
      return NextResponse.json(
        { error: "Telegram ID is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "initiate":
        // Create or update auth session for Telegram login
        const authSession = await prisma.authSession.upsert({
          where: { tgId },
          update: {
            tempKey,
            sessionValid: true,
          },
          create: {
            tgId,
            tempKey,
            sessionValid: true,
          },
        });

        return NextResponse.json({
          success: true,
          sessionId: authSession.tgId,
        });

      case "verify":
        // Verify the Telegram authentication
        const session = await prisma.authSession.findUnique({
          where: { tgId },
          include: { userByTgId: true },
        });

        if (!session || !session.sessionValid || session.tempKey !== tempKey) {
          return NextResponse.json(
            { error: "Invalid session or temp key" },
            { status: 401 }
          );
        }

        // If user exists, link the session
        if (session.userByTgId) {
          await prisma.authSession.update({
            where: { tgId },
            data: { userId: session.userByTgId.id },
          });

          return NextResponse.json({
            success: true,
            user: session.userByTgId,
          });
        }

        return NextResponse.json({
          success: true,
          requiresRegistration: true,
        });

      case "link":
        // Link Telegram account to existing user
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Update user with Telegram ID
        await prisma.user.update({
          where: { id: user.id },
          data: { tgId },
        });

        // Update auth session
        await prisma.authSession.update({
          where: { tgId },
          data: { userId: user.id },
        });

        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in Telegram auth:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
