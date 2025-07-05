"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * The 404 Not Found page for the TaskIQ application.
 * This Server Component is automatically rendered by Next.js when a route is not found.
 *
 * @returns {JSX.Element} The 404 page component.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-center p-4">
      <div>
        <AlertTriangle className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-2xl font-medium text-muted-foreground">
          Page Not Found
        </p>
        <p className="mt-2 text-muted-foreground">
          Sorry, the page you are looking for does not exist.
        </p>
        <Button asChild className="mt-8 bg-gradient-primary">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
