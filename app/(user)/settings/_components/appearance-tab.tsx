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
import { ColorPicker } from "./color-picker";
import { toast } from "@/hooks/use-toast";

type ColorTheme =
  | "green"
  | "purple"
  | "blue"
  | "red"
  | "orange"
  | "pink"
  | "teal"
  | "indigo";

export function AppearanceTab() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<
    "dark" | "light" | "system"
  >(theme);
  const [selectedColorTheme, setSelectedColorTheme] =
    useState<ColorTheme>(colorTheme);

  /**
   * Handles theme selection (doesn't apply immediately)
   * @param {Theme} newTheme - The theme to select
   */
  const handleThemeSelection = (newTheme: "dark" | "light" | "system") => {
    setSelectedTheme(newTheme);
  };

  /**
   * Handles color theme selection (doesn't apply immediately)
   * @param {ColorTheme} newColorTheme - The color theme to select
   */
  const handleColorThemeSelection = (newColorTheme: ColorTheme) => {
    setSelectedColorTheme(newColorTheme);
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

  /**
   * Applies the selected color theme and shows toast notification
   */
  const handleColorThemeUpdate = () => {
    setColorTheme(selectedColorTheme);
    toast({
      title: "Color theme updated",
      description: `Switched to ${selectedColorTheme} color theme.`,
    });
  };

  /**
   * Applies both theme and color theme changes
   */
  const handleAllUpdates = () => {
    if (hasThemeChanged) {
      setTheme(selectedTheme);
    }
    if (hasColorThemeChanged) {
      setColorTheme(selectedColorTheme);
    }

    toast({
      title: "Appearance updated",
      description: "Your theme and color preferences have been saved.",
    });
  };

  // Check if theme has changed from current
  const hasThemeChanged = selectedTheme !== theme;
  const hasColorThemeChanged = selectedColorTheme !== colorTheme;
  const hasAnyChanges = hasThemeChanged || hasColorThemeChanged;

  // Reset selectedTheme to current theme when component unmounts or theme changes externally
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  // Reset selectedColorTheme to current color theme when it changes externally
  useEffect(() => {
    setSelectedColorTheme(colorTheme);
  }, [colorTheme]);

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

          <div className="flex justify-end space-x-2">
            <Button
              className={`bg-gradient-primary ${
                !hasThemeChanged
                  ? "disabled:!pointer-events-auto disabled:!cursor-not-allowed disabled:hover:!cursor-not-allowed"
                  : ""
              }`}
              disabled={!hasThemeChanged}
              onClick={handleThemeUpdate}
              variant={hasAnyChanges ? "outline" : "default"}
            >
              Update Theme
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Color theme</CardTitle>
          <CardDescription className="text-muted-foreground">
            Customize the accent color for buttons, indicators, and highlights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ColorPicker
            selectedColor={selectedColorTheme}
            onColorSelect={handleColorThemeSelection}
          />

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button
              className={`bg-gradient-primary ${
                !hasColorThemeChanged
                  ? "disabled:!pointer-events-auto disabled:!cursor-not-allowed disabled:hover:!cursor-not-allowed"
                  : ""
              }`}
              disabled={!hasColorThemeChanged}
              onClick={handleColorThemeUpdate}
              variant={hasAnyChanges ? "outline" : "default"}
            >
              Update Colors
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Apply All Changes Button */}
      {hasAnyChanges && (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  You have unsaved changes
                </p>
                <p className="text-xs text-muted-foreground">
                  Apply all your appearance changes at once
                </p>
              </div>
              <Button
                className="bg-gradient-primary"
                onClick={handleAllUpdates}
              >
                Apply All Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
