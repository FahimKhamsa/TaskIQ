"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/custom/logo";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Plug,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Configuration for the dropdown menu items.
const dropdownItems = [
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
            <Logo href="/" />
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {/* Dashboard Link */}
            <Link href="/dashboard">
              <Button
                variant={
                  pathname.startsWith("/dashboard") ? "secondary" : "ghost"
                }
                size="sm"
                className={cn(
                  "flex items-center space-x-2 transition-smooth",
                  pathname.startsWith("/dashboard") &&
                    "bg-secondary text-secondary-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      FR
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Fahim Rahman</p>
                    <p className="text-xs text-muted-foreground">
                      fahimrahman39281@gmail.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dropdownItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    // Handle logout logic here
                    console.log("Logout clicked");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
