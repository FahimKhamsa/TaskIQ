"use client";

import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  theme: "system" | "light" | "dark";
  isSelected: boolean;
  onClick: () => void;
}

export function ThemePreview({
  theme,
  isSelected,
  onClick,
}: ThemePreviewProps) {
  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border-2 p-1 transition-all duration-75",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      {/* Theme Preview Card */}
      <div className="aspect-[4/3] overflow-hidden rounded-md">
        {theme === "system" && (
          <div className="h-full w-full">
            {/* Split view - half light, half dark */}
            <div className="flex h-full">
              {/* Light side */}
              <div className="flex-1 bg-white">
                <div className="h-3 bg-gray-100"></div>
                <div className="space-y-2 p-3">
                  <div className="h-2 w-3/4 rounded bg-gray-300"></div>
                  <div className="h-2 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-2 w-2/3 rounded bg-gray-300"></div>
                </div>
              </div>
              {/* Dark side */}
              <div className="flex-1 bg-gray-900">
                <div className="h-3 bg-gray-800"></div>
                <div className="space-y-2 p-3">
                  <div className="h-2 w-3/4 rounded bg-gray-600"></div>
                  <div className="h-2 w-1/2 rounded bg-gray-700"></div>
                  <div className="h-2 w-2/3 rounded bg-gray-600"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {theme === "light" && (
          <div className="h-full w-full bg-white">
            <div className="h-3 bg-gray-100"></div>
            <div className="space-y-2 p-3">
              <div className="h-2 w-3/4 rounded bg-gray-300"></div>
              <div className="h-2 w-1/2 rounded bg-gray-200"></div>
              <div className="h-2 w-2/3 rounded bg-gray-300"></div>
              <div className="mt-3 h-8 w-full rounded bg-gray-100"></div>
            </div>
          </div>
        )}

        {theme === "dark" && (
          <div className="h-full w-full bg-gray-900">
            <div className="h-3 bg-gray-800"></div>
            <div className="space-y-2 p-3">
              <div className="h-2 w-3/4 rounded bg-gray-600"></div>
              <div className="h-2 w-1/2 rounded bg-gray-700"></div>
              <div className="h-2 w-2/3 rounded bg-gray-600"></div>
              <div className="mt-3 h-8 w-full rounded bg-gray-800"></div>
            </div>
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary"></div>
      )}
    </div>
  );
}
