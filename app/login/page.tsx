"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        <Bot className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold text-foreground">
          Welcome to TaskIQ
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to continue to your dashboard
        </p>
        <Button
          onClick={handleGoogleLogin}
          className="w-full mt-8 bg-gradient-primary"
          size="lg"
        >
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}
