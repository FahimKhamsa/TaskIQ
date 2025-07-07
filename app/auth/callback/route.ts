import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!userError && user) {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (!existingUser) {
            // User doesn't exist in database, redirect to registration
            return NextResponse.redirect(`${origin}/register`);
          }

          // User exists, proceed to dashboard or requested page
          return NextResponse.redirect(`${origin}${next}`);
        } catch (dbError) {
          console.error("Database error during auth callback:", dbError);
          // If database check fails, redirect to registration to be safe
          return NextResponse.redirect(`${origin}/register`);
        }
      }
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate user`
  );
}
