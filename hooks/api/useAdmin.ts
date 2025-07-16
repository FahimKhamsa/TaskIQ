import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import type {
  AdminStatsResponse,
  SystemStatsResponse,
  SystemHealthResponse,
  AdminAnalytics,
  AdminAnalyticsResponse,
  AdminAnalyticsListResponse,
  GenerateAnalyticsRequest,
  AdminUsersResponse,
  AdminUser,
  AdminLogsResponse,
  CreateLogRequest,
  UpdateLogRequest,
  Announcement,
  CreateAnnouncementRequest,
} from "@/lib/api/types";

/**
 * Hook to fetch admin analytics/stats (legacy)
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiCall<AdminStatsResponse>("/admin/system/stats"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch system statistics with real-time data
 */
export const useSystemStats = () => {
  return useQuery({
    queryKey: ["system-stats"],
    queryFn: () => apiCall<SystemStatsResponse>("/admin/system/stats"),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
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
 * Hook to fetch detailed admin analytics (latest or by ID)
 */
export const useAdminAnalytics = (id?: string, options?: {
  useStored?: boolean;
  maxAge?: number;
  period?: string;
  calculate?: boolean;
}) => {
  const params = new URLSearchParams();
  
  if (id) params.set('id', id);
  if (options?.useStored) params.set('useStored', 'true');
  if (options?.maxAge) params.set('maxAge', options.maxAge.toString());
  if (options?.period) params.set('period', options.period);
  if (options?.calculate) params.set('calculate', 'true');

  return useQuery({
    queryKey: ["admin-analytics", id, options],
    queryFn: () => apiCall<AdminAnalyticsResponse>(`/admin/analytics?${params.toString()}`),
    select: (data) => data.analytics,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to fetch all admin analytics records
 */
export const useAdminAnalyticsList = () => {
  return useQuery({
    queryKey: ["admin-analytics-list"],
    queryFn: () => apiCall<AdminAnalyticsListResponse>("/admin/analytics/list"),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Hook to create/generate new admin analytics
 */
export const useGenerateAdminAnalytics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: GenerateAnalyticsRequest = {}) =>
      apiCall<AdminAnalyticsResponse>("/admin/analytics", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-list"] });
      toast({
        title: "Analytics generated successfully",
        description: "New admin analytics snapshot has been created.",
      });
      return data.analytics;
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating analytics",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update admin analytics
 */
export const useUpdateAdminAnalytics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...updateData }: { id: string } & Partial<AdminAnalytics>) =>
      apiCall<AdminAnalyticsResponse>("/admin/analytics", {
        method: "PUT",
        body: JSON.stringify({ id, ...updateData }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics", variables.id] });
      toast({
        title: "Analytics updated successfully",
        description: "Admin analytics record has been updated.",
      });
      return data.analytics;
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating analytics",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete admin analytics
 */
export const useDeleteAdminAnalytics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) =>
      apiCall(`/admin/analytics?id=${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-list"] });
      queryClient.removeQueries({ queryKey: ["admin-analytics", id] });
      toast({
        title: "Analytics deleted successfully",
        description: "Admin analytics record has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting analytics",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get formatted analytics data for dashboard display
 */
export const useFormattedAdminAnalytics = () => {
  const { data: analytics } = useAdminAnalytics();

  if (!analytics) return null;

  return {
    overview: {
      totalUsers: {
        value: analytics.totalUsers?.toLocaleString() || '0',
        label: 'Total Users',
        icon: '👥',
      },
      conversionRate: {
        value: `${((analytics.conversionRate || 0) * 100).toFixed(2)}%`,
        label: 'Conversion Rate',
        icon: '📈',
      },
      activeIntegrations: {
        value: analytics.activeIntegrations?.length.toString() || '0',
        label: 'Active Integrations',
        icon: '🔗',
      },
      topCommands: {
        value: analytics.mostUsedCommands?.length.toString() || '0',
        label: 'Commands Tracked',
        icon: '⚡',
      },
    },
    topUsers: analytics.topUsers || [],
    recentUsers: analytics.recentlyAddedUsers || [],
    integrations: analytics.activeIntegrations || [],
    commands: analytics.mostUsedCommands || [],
    lastUpdated: analytics.createdAt,
  };
};

/**
 * Utility hook to check if analytics data is stale
 */
export const useAnalyticsStatus = () => {
  const { data: analytics } = useAdminAnalytics();

  if (!analytics?.createdAt) {
    return {
      isStale: true,
      age: 0,
      status: 'no-data',
      message: 'No analytics data available',
    };
  }

  const now = new Date();
  const createdAt = new Date(analytics.createdAt);
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  return {
    isStale: ageInHours > 24,
    age: Math.round(ageInHours * 10) / 10,
    status: ageInHours > 24 ? 'stale' : ageInHours > 12 ? 'aging' : 'fresh',
    message: ageInHours > 24 
      ? `Data is ${Math.round(ageInHours)} hours old`
      : ageInHours > 12 
      ? `Data is ${Math.round(ageInHours)} hours old`
      : 'Data is up to date',
  };
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
 * Hook to fetch admin logs with filtering
 */
export const useAdminLogs = (
  page: number = 1, 
  limit: number = 50,
  filters?: {
    type?: string;
    userId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  
  if (filters?.type) params.set('type', filters.type);
  if (filters?.userId) params.set('userId', filters.userId);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);

  return useQuery({
    queryKey: ["admin-logs", page, limit, filters],
    queryFn: () => apiCall<AdminLogsResponse>(`/admin/logs?${params.toString()}`),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to create a new log entry (admin only)
 */
export const useCreateLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (logData: CreateLogRequest) =>
      apiCall<{ log: any }>("/admin/logs", {
        method: "POST",
        body: JSON.stringify(logData),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      toast({
        title: "Log created successfully",
        description: "New log entry has been added.",
      });
      return data.log;
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating log",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update a log entry (admin only)
 */
export const useUpdateLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (logData: UpdateLogRequest) =>
      apiCall<{ log: any }>("/admin/logs", {
        method: "PUT",
        body: JSON.stringify(logData),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      toast({
        title: "Log updated successfully",
        description: "Log entry has been updated.",
      });
      return data.log;
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating log",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete a log entry (admin only)
 */
export const useDeleteLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (logId: string) =>
      apiCall(`/admin/logs?id=${logId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, logId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      toast({
        title: "Log deleted successfully",
        description: "Log entry has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting log",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get user management data (admin only)
 */
export const useAdminUsers = (
  page: number = 1, 
  limit: number = 20, 
  options?: {
    search?: string;
    planFilter?: string;
    statusFilter?: string;
    forceRefresh?: boolean;
  }
) => {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  
  if (options?.search) params.set('search', options.search);
  if (options?.planFilter) params.set('plan', options.planFilter);
  if (options?.statusFilter) params.set('status', options.statusFilter);
  if (options?.forceRefresh) params.set('refresh', 'true');

  return useQuery({
    queryKey: ["admin-users", page, limit, options?.search, options?.planFilter, options?.statusFilter],
    queryFn: () => apiCall<AdminUsersResponse>(`/admin/users?${params.toString()}`),
    staleTime: options?.forceRefresh ? 0 : 1000 * 60 * 2, // 2 minutes, 0 if force refresh
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

/**
 * Hook for user management operations with optimistic updates
 */
export const useUserManagementOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const suspendUser = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'suspend' | 'unsuspend' }) => {
      const endpoint = action === 'suspend' ? 'suspend' : 'unsuspend';
      return apiCall(`/admin/users/${userId}/${endpoint}`, {
        method: 'POST',
      });
    },
    onMutate: async ({ userId, action }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueriesData({ queryKey: ["admin-users"] });

      // Optimistically update the user status
      queryClient.setQueriesData({ queryKey: ["admin-users"] }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          users: old.users.map((user: AdminUser) => 
            user.id === userId 
              ? { ...user, status: action === 'suspend' ? 'suspended' : 'active' }
              : user
          ),
          stats: {
            ...old.stats,
            suspendedUsers: action === 'suspend' 
              ? old.stats.suspendedUsers + 1 
              : Math.max(0, old.stats.suspendedUsers - 1),
            activeUsers: action === 'suspend' 
              ? Math.max(0, old.stats.activeUsers - 1)
              : old.stats.activeUsers + 1,
          }
        };
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast({
        title: `Error ${variables.action}ing user`,
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: `User ${variables.action}ed successfully`,
        description: `The user has been ${variables.action}ed.`,
      });
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      return apiCall(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      
      const previousUsers = queryClient.getQueriesData({ queryKey: ["admin-users"] });

      // Optimistically remove the user
      queryClient.setQueriesData({ queryKey: ["admin-users"] }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          users: old.users.filter((user: AdminUser) => user.id !== userId),
          stats: {
            ...old.stats,
            totalUsers: Math.max(0, old.stats.totalUsers - 1),
          }
        };
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast({
        title: "Error deleting user",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "User deleted successfully",
        description: "The user has been permanently deleted.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: any }) => {
      return apiCall(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      toast({
        title: "User updated successfully",
        description: "User information has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast({
        title: "Error updating user",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: any) => {
      return apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "New user has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast({
        title: "Error creating user",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  return {
    suspendUser,
    deleteUser,
    updateUser,
    createUser,
  };
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
  const { data: statsData } = useAdminStats();
  const { data: healthData } = useSystemHealth();

  if (!statsData) return null;

  return {
    totalUsers: {
      value: statsData.totalUsers.toLocaleString(),
      label: "Total Users",
      trend: statsData.activeUsers > 0 ? "up" : "stable",
    },
    activeUsers: {
      value: statsData.activeUsers.toLocaleString(),
      label: "Active Users",
      trend: "up",
    },
    totalCreditsUsed: {
      value: statsData.totalCreditsUsed.toLocaleString(),
      label: "Credits Used",
      trend: "up",
    },
    totalRevenue: {
      value: `$${statsData.totalRevenue.toLocaleString()}`,
      label: "Total Revenue",
      trend: "up",
    },
    conversionRate: {
      value: `${(statsData.conversionRate * 100).toFixed(1)}%`,
      label: "Conversion Rate",
      trend: statsData.conversionRate > 0.1 ? "up" : "down",
    },
    systemHealth: {
      value: healthData?.status || "unknown",
      label: "System Health",
      trend: healthData?.status === "healthy" ? "up" : "down",
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
