"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

/**
 * Providers component wraps all the client-side context providers
 * that the application needs. This includes React Query, Tooltips, and Toasters.
 * By isolating these in a client component, the root layout can remain a server component.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components that will consume the contexts.
 * @returns {JSX.Element} The provider-wrapped children.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Using useState to ensure the QueryClient is only created once per component lifecycle.
  // This is the recommended approach for using React Query with the Next.js App Router.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
