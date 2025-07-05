"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Plug,
  LogOut,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Configuration for the main navigation links.
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Integrations", href: "/integrations", icon: Plug },
];

/**
 * The main navigation bar for the application.
 * This is a Client Component because it uses the `usePathname` hook to determine the active link.
 *
 * @returns {JSX.Element} The Navbar component.
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-navbar border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">TaskIQ</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.name} href={item.href} passHref>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 transition-smooth",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              // Handle logout logic here
              console.log("Logout clicked");
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
