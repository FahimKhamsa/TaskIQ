import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Check if user exists in database
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existingUser) {
      // User is authenticated but not registered in database
      return redirect("/register");
    }
  } catch (error) {
    console.error("Database error in user layout:", error);
    // If database check fails, redirect to registration to be safe
    return redirect("/register");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="bg-content">{children}</main>
    </div>
  );
}
