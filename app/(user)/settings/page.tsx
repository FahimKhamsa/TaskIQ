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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Palette, Monitor, Sun, Moon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../../../providers/theme-provider";
import { ThemePreview } from "./_components/theme-preview";
import { toast } from "@/hooks/use-toast";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/api/useUsers";
import { useSupabase } from "@/providers/auth-provider";

// Configuration for the settings navigation tabs.
const settingsTabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "appearance", name: "Appearance", icon: Palette },
];

// Options for theme selection.
const themeOptions = [
  {
    id: "system",
    name: "System",
    description: "Adapts to your system preference",
    icon: Monitor,
  },
  {
    id: "light",
    name: "Light",
    description: "Light mode interface",
    icon: Sun,
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark mode interface (Current)",
    icon: Moon,
  },
];

/**
 * The Settings page for the TaskIQ application.
 * This is a Client Component as it uses state for managing active tabs, form data, and theme selection.
 *
 * @returns {JSX.Element} The settings page component.
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<
    "dark" | "light" | "system"
  >(theme);

  // Fetch user data using the hook
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  const updateUserMutation = useUpdateUserProfile();
  const { session } = useSupabase();

  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    bio: "",
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData) {
      setProfileData({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dob
          ? new Date(userData.dob).toISOString().split("T")[0]
          : "",
        bio: "", // Add bio field to your database if needed
      });
    }
  }, [userData]);

  // Get Google profile picture from session
  const profilePicture =
    session?.user?.user_metadata?.picture ||
    session?.user?.user_metadata?.avatar_url;

  /**
   * Handles changes to the profile form input fields.
   * @param {string} field - The name of the field being updated.
   * @param {string} value - The new value for the field.
   */
  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handles saving profile changes
   */
  const handleSaveProfile = async () => {
    const fullName = profileData.fullName.trim();

    if (!fullName) {
      toast({
        title: "Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return;
    }

    const firstName = fullName.split(" ")[0] || "";
    const lastName = fullName.split(" ").slice(1).join(" ") || "";
    try {
      await updateUserMutation.mutateAsync({
        fullName,
        firstName,
        lastName,
        phone: profileData.phone || undefined,
        dob: profileData.dateOfBirth || undefined,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

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

  // Reset selectedTheme to current theme when leaving appearance tab without saving
  useEffect(() => {
    if (activeTab !== "appearance" && hasThemeChanged) {
      setSelectedTheme(theme);
    }
  }, [activeTab, theme, hasThemeChanged]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-sidebar md:border-r md:border-border p-4 md:p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your account settings
              </p>
            </div>

            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    activeTab === tab.id
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Profile
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your personal information and account details
                  </p>
                </div>

                {isLoadingUser ? (
                  <Card className="bg-gradient-card border-border shadow-card">
                    <CardContent className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">
                        Loading user data...
                      </span>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-card border-border shadow-card">
                    <CardHeader>
                      <CardTitle className="text-foreground">
                        Personal Information
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Update your personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Left side - Full Name and Telegram Username */}
                        <div className="md:col-span-3 space-y-4">
                          <div>
                            <Label
                              htmlFor="fullName"
                              className="text-foreground"
                            >
                              Full Name
                            </Label>
                            <Input
                              id="fullName"
                              value={profileData.fullName}
                              onChange={(e) =>
                                handleInputChange("fullName", e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="telegramUsername"
                              className="text-foreground"
                            >
                              Telegram Username
                            </Label>
                            <Input
                              id="telegramUsername"
                              value={userData?.tgId ? `@${userData.tgId}` : ""}
                              className="mt-1"
                              disabled
                            />
                          </div>
                        </div>

                        {/* Right side - Profile Picture centered in remaining space */}
                        <div className="flex items-center justify-center">
                          <Avatar className="h-32 w-32">
                            <AvatarImage
                              src={profilePicture}
                              alt="User Avatar"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                              {userData?.fullName
                                ? userData.fullName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-foreground">
                          Email
                        </Label>
                        <div className="mt-1 flex items-center space-x-2">
                          <Input
                            id="email"
                            value={userData?.email || ""}
                            className="flex-1"
                            disabled
                          />
                          <Badge className="bg-primary/20 text-primary">
                            Primary
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-foreground">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="+1 (555) 123-4567"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dob" className="text-foreground">
                            Date of Birth
                          </Label>
                          <Input
                            id="dob"
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) =>
                              handleInputChange("dateOfBirth", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button
                          className="bg-gradient-primary"
                          onClick={handleSaveProfile}
                          disabled={updateUserMutation.isPending}
                        >
                          {updateUserMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Appearance
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage settings for your booking appearance
                  </p>
                </div>

                <Card className="bg-gradient-card border-border shadow-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Dashboard theme
                    </CardTitle>
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
                        <p className="mt-2 text-sm font-medium text-foreground">
                          Light
                        </p>
                      </div>
                      <div className="text-center">
                        <ThemePreview
                          theme="dark"
                          isSelected={selectedTheme === "dark"}
                          onClick={() => handleThemeSelection("dark")}
                        />
                        <p className="mt-2 text-sm font-medium text-foreground">
                          Dark
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button
                        className="bg-gradient-primary"
                        disabled={!hasThemeChanged}
                        onClick={handleThemeUpdate}
                      >
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
