"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

interface LogoProps {
  href?: string;
  className?: string;
}

/**
 * Reusable Logo component for TaskIQ
 * @param href - The link destination (defaults to "/")
 * @param className - Additional CSS classes
 */
// the href needs to be changed, currently for development //
export function Logo({ href = "/dashboard", className = "" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center space-x-2 ${className}`}>
      <Bot className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-foreground">TaskIQ</span>
    </Link>
  );
}
