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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Palette,
  Monitor,
  Sun,
  Moon,
  Upload,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../../../providers/theme-provider";
import { ThemePreview } from "./_components/theme-preview";
import { toast } from "@/hooks/use-toast";

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

  const [profileData, setProfileData] = useState({
    name: "Fahim Rahman",
    email: "fahimrahman39281@gmail.com",
    username: "deady",
    phone: "",
    dateOfBirth: "",
    bio: "",
  });

  /**
   * Handles changes to the profile form input fields.
   * @param {string} field - The name of the field being updated.
   * @param {string} value - The new value for the field.
   */
  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
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

                <Card className="bg-gradient-card border-border shadow-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Profile Picture
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Update your profile picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src="/placeholder-avatar.jpg"
                          alt="User Avatar"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {profileData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-foreground">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-foreground">
                          Username
                        </Label>
                        <div className="mt-1 flex">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                            taskiq.com/
                          </span>
                          <Input
                            id="username"
                            value={profileData.username}
                            onChange={(e) =>
                              handleInputChange("username", e.target.value)
                            }
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Email
                      </Label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Input
                          id="email"
                          value={profileData.email}
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

                    <div>
                      <Label htmlFor="bio" className="text-foreground">
                        About
                      </Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Tell us a bit about yourself"
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button className="bg-gradient-primary">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
