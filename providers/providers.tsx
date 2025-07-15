"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "./auth-provider";

/**
 * Providers component wraps all the client-side context providers
 * that the application needs. This includes React Query with persistence, Theme, Tooltips, Toasters, and Auth.
 * By isolating these in a client component, the root layout can remain a server component.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components that will consume the contexts.
 * @returns {JSX.Element} The provider-wrapped children.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Enhanced QueryClient configuration with better defaults for dashboard data
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
            gcTime: 1000 * 60 * 60, // 1 hour - keep in cache (renamed from cacheTime)
            refetchOnWindowFocus: true, // Refresh when user returns to tab
            refetchOnReconnect: true, // Refresh when network reconnects
            retry: 3, // Retry failed requests 3 times
          },
        },
      })
  );

  // Create persister for localStorage (only on client side)
  const [persister] = useState(() => {
    if (typeof window !== "undefined") {
      return createSyncStoragePersister({
        storage: window.localStorage,
        key: "TASKIQ_QUERY_CACHE",
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      });
    }
    return undefined;
  });

  // Conditional rendering based on persister availability
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          buster: "v1", // Increment to invalidate cache on app updates
        }}
      >
        <ThemeProvider defaultTheme="dark" storageKey="taskiq-ui-theme">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    );
  }

  // Fallback to regular QueryClientProvider (SSR or when localStorage is not available)
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="taskiq-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
