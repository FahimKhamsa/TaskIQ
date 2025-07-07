"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "../../../../providers/theme-provider";
import { ThemePreview } from "./theme-preview";
import { toast } from "@/hooks/use-toast";

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<
    "dark" | "light" | "system"
  >(theme);

  /**
   * Handles theme selection (doesn't apply immediately)
   * @param {Theme} newTheme - The theme to select
   */
  const handleThemeSelection = (newTheme: "dark" | "light" | "system") => {
    setSelectedTheme(newTheme);
  };

  /**
   * Applies the selected theme and shows toast notification
   */
  const handleThemeUpdate = () => {
    setTheme(selectedTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${
        selectedTheme === "system" ? "system default" : selectedTheme
      } theme.`,
    });
  };

  // Check if theme has changed from current
  const hasThemeChanged = selectedTheme !== theme;

  // Reset selectedTheme to current theme when component unmounts or theme changes externally
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Manage settings for your booking appearance
        </p>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Dashboard theme</CardTitle>
          <CardDescription className="text-muted-foreground">
            This only applies to your logged in dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <ThemePreview
                theme="system"
                isSelected={selectedTheme === "system"}
                onClick={() => handleThemeSelection("system")}
              />
              <p className="mt-2 text-sm font-medium text-foreground">
                System default
              </p>
            </div>
            <div className="text-center">
              <ThemePreview
                theme="light"
                isSelected={selectedTheme === "light"}
                onClick={() => handleThemeSelection("light")}
              />
              <p className="mt-2 text-sm font-medium text-foreground">Light</p>
            </div>
            <div className="text-center">
              <ThemePreview
                theme="dark"
                isSelected={selectedTheme === "dark"}
                onClick={() => handleThemeSelection("dark")}
              />
              <p className="mt-2 text-sm font-medium text-foreground">Dark</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              className={`bg-gradient-primary ${
                !hasThemeChanged
                  ? "disabled:!pointer-events-auto disabled:!cursor-not-allowed disabled:hover:!cursor-not-allowed"
                  : ""
              }`}
              disabled={!hasThemeChanged}
              onClick={handleThemeUpdate}
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
