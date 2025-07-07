"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Loader2, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/api/useAuth";

interface RegistrationData {
  telegramUsername: string;
  dateOfBirth: string;
  phoneNumber?: string;
}

interface GoogleUserData {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegistrationData>({
    telegramUsername: "",
    dateOfBirth: "",
    phoneNumber: "",
  });
  const [googleUserData, setGoogleUserData] = useState<GoogleUserData | null>(
    null
  );
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const { registerUser, isLoading } = useAuth();

  // Fetch Google user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          toast({
            title: "Authentication Error",
            description: "Please sign in again to complete registration.",
            variant: "destructive",
          });
          router.push("/login");
          return;
        }

        const userMetadata = user.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || "";
        const [firstName, ...lastNameParts] = fullName.split(" ");
        const lastName = lastNameParts.join(" ");
        setGoogleUserData({
          fullName,
          firstName,
          lastName,
          email: user.email || "",
          picture: userMetadata.picture || userMetadata.avatar_url || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user information.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [supabase, toast, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get current user from Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to complete registration.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Validate required fields
      if (!formData.telegramUsername || !formData.dateOfBirth) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Validate date of birth (must be at least 13 years old)
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        age < 13 ||
        (age === 13 && monthDiff < 0) ||
        (age === 13 && monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        toast({
          title: "Age Requirement",
          description: "You must be at least 13 years old to register.",
          variant: "destructive",
        });
        return;
      }

      // Use the custom hook to register user
      await registerUser({
        telegramUsername: formData.telegramUsername,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber || undefined,
      });
    } catch (error) {
      // Error handling is done in the useAuth hook
      console.error("Registration error:", error);
    }
  };

  if (isLoadingUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Bot className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">
            Complete Your Registration
          </CardTitle>
          <CardDescription>
            {googleUserData?.fullName && (
              <span className="block mb-2 text-foreground font-medium">
                Welcome, {googleUserData.fullName}!
              </span>
            )}
            Please provide some additional information to complete your account
            setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google Account Info Display */}
          {googleUserData && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center space-x-3">
                {googleUserData.picture ? (
                  <img
                    src={googleUserData.picture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {googleUserData.fullName}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Mail className="w-3 h-3 mr-1" />
                    <span className="truncate">{googleUserData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegramUsername">
                Telegram Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="telegramUsername"
                name="telegramUsername"
                type="text"
                placeholder="@yourusername"
                value={formData.telegramUsername}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Your Telegram username (with or without @)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
