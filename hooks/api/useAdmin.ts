import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type {
  AdminStatsResponse,
  SystemHealthResponse,
  AdminAnalytics,
  Announcement,
  CreateAnnouncementRequest,
} from "@/lib/api/types";

/**
 * Hook to fetch admin analytics/stats
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiCall<AdminStatsResponse>("/admin/system/stats"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch system health status
 */
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: () => apiCall<SystemHealthResponse>("/admin/system/health"),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

/**
 * Hook to fetch detailed admin analytics
 */
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => apiCall<{ analytics: AdminAnalytics }>("/admin/analytics"),
    select: (data) => data.analytics,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to fetch all announcements (admin only)
 */
export const useAnnouncements = () => {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () =>
      apiCall<{ announcements: Announcement[] }>("/admin/announcements"),
    select: (data) => data.announcements,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create new announcement (admin only)
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (announcementData: CreateAnnouncementRequest) =>
      apiCall<{ announcement: Announcement }>("/admin/announcements", {
        method: "POST",
        body: JSON.stringify(announcementData),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({
        title: "Announcement created successfully",
        description: `Announcement "${data.announcement.title}" has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating announcement",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update announcement (admin only)
 */
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      announcementId,
      announcementData,
    }: {
      announcementId: string;
      announcementData: Partial<CreateAnnouncementRequest>;
    }) =>
      apiCall<{ announcement: Announcement }>(
        `/admin/announcements/${announcementId}`,
        {
          method: "PUT",
          body: JSON.stringify(announcementData),
        }
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({
        title: "Announcement updated successfully",
        description: `Announcement "${data.announcement.title}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating announcement",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete announcement (admin only)
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (announcementId: string) =>
      apiCall(`/admin/announcements/${announcementId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({
        title: "Announcement deleted successfully",
        description: "The announcement has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting announcement",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to fetch admin logs
 */
export const useAdminLogs = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ["admin-logs", page, limit],
    queryFn: () => apiCall(`/admin/logs?page=${page}&limit=${limit}`),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get user management data (admin only)
 */
export const useAdminUsers = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: () => apiCall(`/admin/users?page=${page}&limit=${limit}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to ban/unban user (admin only)
 */
export const useBanUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, banned }: { userId: string; banned: boolean }) =>
      apiCall(`/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ banned }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      toast({
        title: variables.banned
          ? "User banned successfully"
          : "User unbanned successfully",
        description: variables.banned
          ? "The user has been banned from the platform."
          : "The user has been unbanned and can access the platform.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating user status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Utility hook to format admin stats for dashboard
 */
export const useFormattedAdminStats = () => {
  const { data: stats } = useAdminStats();
  const { data: health } = useSystemHealth();

  if (!stats) return null;

  return {
    totalUsers: {
      value: stats.totalUsers.toLocaleString(),
      label: "Total Users",
      trend: stats.activeUsers > 0 ? "up" : "stable",
    },
    activeUsers: {
      value: stats.activeUsers.toLocaleString(),
      label: "Active Users",
      trend: "up",
    },
    totalCreditsUsed: {
      value: stats.totalCreditsUsed.toLocaleString(),
      label: "Credits Used",
      trend: "up",
    },
    totalRevenue: {
      value: `$${stats.totalRevenue.toLocaleString()}`,
      label: "Total Revenue",
      trend: "up",
    },
    conversionRate: {
      value: `${(stats.conversionRate * 100).toFixed(1)}%`,
      label: "Conversion Rate",
      trend: stats.conversionRate > 0.1 ? "up" : "down",
    },
    systemHealth: {
      value: health?.status || "unknown",
      label: "System Health",
      trend: health?.status === "healthy" ? "up" : "down",
    },
  };
};

/**
 * Utility hook to get announcement status info
 */
export const useAnnouncementStatusInfo = (status: string | null) => {
  const statusInfo = {
    DRAFT: {
      label: "Draft",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      icon: "📝",
    },
    PUBLISHED: {
      label: "Published",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: "✅",
    },
    SHEDULED: {
      label: "Scheduled",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: "⏰",
    },
    FAILED: {
      label: "Failed",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: "❌",
    },
    ARCHIVED: {
      label: "Archived",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: "📦",
    },
  };

  return (
    statusInfo[status as keyof typeof statusInfo] || {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      icon: "❓",
    }
  );
};
