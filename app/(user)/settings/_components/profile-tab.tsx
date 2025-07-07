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
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/api/useUsers";
import { useSupabase } from "@/providers/auth-provider";

interface ProfileData {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
}

export function ProfileTab() {
  // Fetch user data using the hook
  const { data: userData, isLoading: isLoadingUser } = useUserProfile();
  const updateUserMutation = useUpdateUserProfile();
  const { session } = useSupabase();

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    bio: "",
  });

  // Store original data for comparison
  const [originalData, setOriginalData] = useState<ProfileData>({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    bio: "",
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData) {
      const initialData: ProfileData = {
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dob
          ? new Date(userData.dob).toISOString().split("T")[0]
          : "",
        bio: "", // Add bio field to your database if needed
      };
      setProfileData(initialData);
      setOriginalData(initialData);
    }
  }, [userData]);

  // Check if there are any changes
  const hasChanges =
    profileData.fullName !== originalData.fullName ||
    profileData.phone !== originalData.phone ||
    profileData.dateOfBirth !== originalData.dateOfBirth ||
    profileData.bio !== originalData.bio;

  // Get Google profile picture from session
  const profilePicture =
    session?.user?.user_metadata?.picture ||
    session?.user?.user_metadata?.avatar_url;

  /**
   * Handles changes to the profile form input fields.
   * @param {string} field - The name of the field being updated.
   * @param {string} value - The new value for the field.
   */
  const handleInputChange = (field: keyof ProfileData, value: string) => {
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
      // Update original data after successful save
      setOriginalData(profileData);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  /**
   * Handles canceling changes and reverting to original data
   */
  const handleCancelChanges = () => {
    setProfileData(originalData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Profile</h2>
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
                  <Label htmlFor="fullName" className="text-foreground">
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
                  <Label htmlFor="telegramUsername" className="text-foreground">
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
                  <AvatarImage src={profilePicture} alt="User Avatar" />
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
                <Badge className="bg-primary/20 text-primary">Primary</Badge>
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
                  onChange={(e) => handleInputChange("phone", e.target.value)}
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
              <Button
                variant="outline"
                onClick={handleCancelChanges}
                disabled={!hasChanges}
                className={
                  !hasChanges
                    ? "disabled:!pointer-events-auto disabled:!cursor-not-allowed disabled:hover:!cursor-not-allowed"
                    : ""
                }
              >
                Cancel
              </Button>
              <Button
                className={`bg-gradient-primary ${
                  updateUserMutation.isPending || !hasChanges
                    ? "disabled:!pointer-events-auto disabled:!cursor-not-allowed disabled:hover:!cursor-not-allowed"
                    : ""
                }`}
                onClick={handleSaveProfile}
                disabled={updateUserMutation.isPending || !hasChanges}
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
  );
}
