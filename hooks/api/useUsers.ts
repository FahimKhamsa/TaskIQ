import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type {
  UserProfileResponse,
  UserWithRelations,
  UpdateUserRequest,
} from "@/lib/api/types";

/**
 * Hook to fetch current user's profile with all relations
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => apiCall<UserProfileResponse>("/users/me"),
    select: (data) => data.user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update current user's profile
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userData: UpdateUserRequest) =>
      apiCall<UserProfileResponse>("/users/me", {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
      return data.user;
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to fetch specific user by ID (admin only)
 */
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiCall<UserProfileResponse>(`/users/${userId}`),
    select: (data) => data.user,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch all users (admin only)
 */
export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => apiCall(`/users?page=${page}&limit=${limit}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update specific user (admin only)
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserRequest;
    }) =>
      apiCall<UserProfileResponse>(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User updated successfully",
        description: "User profile has been updated.",
      });
      return data.user;
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete user (admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userId: string) =>
      apiCall(`/users/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.removeQueries({ queryKey: ["user", userId] });
      toast({
        title: "User deleted successfully",
        description: "User account has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get user analytics (admin only)
 */
export const useUserAnalytics = (userId: string) => {
  return useQuery({
    queryKey: ["user-analytics", userId],
    queryFn: () => apiCall(`/users/${userId}/analytics`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to get current user's analytics with enhanced persistence and error handling
 */
export const useCurrentUserAnalytics = (period: number = 30) => {
  const { data: user } = useUserProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["current-user-analytics", user?.id, period],
    queryFn: () => apiCall(`/users/${user?.id}/analytics?period=${period}`),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
    gcTime: 1000 * 60 * 60, // 1 hour - keep in cache
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnReconnect: true, // Refresh when network reconnects
    retry: 3, // Retry failed requests 3 times
    select: (data: any) => data.analytics,
    meta: {
      // Mark this query as important for persistence
      persist: true,
    },
  });

  // Handle errors with cached data awareness
  if (query.error && !query.data) {
    const cachedData = queryClient.getQueryData([
      "current-user-analytics",
      user?.id,
      period,
    ]);

    if (!cachedData) {
      toast({
        title: "Failed to load analytics",
        description: "Unable to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  }

  return query;
};

/**
 * Utility hook to check if user has premium subscription
 */
export const useIsPremium = () => {
  const { data: user } = useUserProfile();

  if (!user?.subscription) return false;

  return (
    user.subscription.isSubscribed &&
    user.subscription.plan !== "FREE" &&
    user.subscription.endDate &&
    new Date(user.subscription.endDate) > new Date()
  );
};

/**
 * Utility hook to get user's active Google integrations
 */
export const useActiveIntegrations = () => {
  const { data: user } = useUserProfile();

  if (!user?.googleTokens) return [];

  return user.googleTokens.filter(
    (token) =>
      token.accessToken && token.expiry && new Date(token.expiry) > new Date()
  );
};

/**
 * Utility hook to check if user has specific Google service connected
 */
export const useHasIntegration = (service: "GMAIL" | "CALENDAR" | "DRIVE") => {
  const activeIntegrations = useActiveIntegrations();

  return activeIntegrations.some(
    (integration) => integration.services === service
  );
};
