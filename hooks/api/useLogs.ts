import { useQuery } from "@tanstack/react-query";
import { apiCall } from "@/lib/api/client";
import type { LogsResponse, Log, LogType } from "@/lib/api/types";

/**
 * Hook to fetch current user's logs
 */
export const useLogs = (
  page: number = 1,
  limit: number = 10,
  type?: LogType
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(type && { type }),
  });

  return useQuery({
    queryKey: ["logs", page, limit, type],
    queryFn: () => apiCall<LogsResponse>(`/logs?${params.toString()}`),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch specific user's logs (admin only)
 */
export const useUserLogs = (
  userId: string,
  page: number = 1,
  limit: number = 10,
  type?: LogType
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(type && { type }),
  });

  return useQuery({
    queryKey: ["logs", userId, page, limit, type],
    queryFn: () =>
      apiCall<LogsResponse>(`/logs/${userId}?${params.toString()}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch recent activity logs for dashboard
 */
export const useRecentActivity = (limit: number = 5) => {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: () => apiCall<LogsResponse>(`/logs?limit=${limit}&recent=true`),
    select: (data) => data.logs,
    staleTime: 1000 * 60 * 1, // 1 minute for recent activity
  });
};

/**
 * Hook to fetch log types for filtering
 */
export const useLogTypes = () => {
  return useQuery({
    queryKey: ["log-types"],
    queryFn: () => apiCall("/logs/types"),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Utility hook to format log content for display
 */
export const useFormattedLogs = (logs: Log[] | undefined) => {
  if (!logs) return [];

  return logs.map((log) => ({
    ...log,
    formattedTime: formatLogTime(log.createdAt),
    typeColor: getLogTypeColor(log.type),
    icon: getLogTypeIcon(log.type),
  }));
};

/**
 * Utility function to format log timestamp
 */
const formatLogTime = (timestamp: Date | null): string => {
  if (!timestamp) return "Unknown time";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
};

/**
 * Utility function to get color for log type
 */
const getLogTypeColor = (type: LogType | null): string => {
  switch (type) {
    case "SUCCESS":
      return "text-green-600 dark:text-green-400";
    case "WARNING":
      return "text-yellow-600 dark:text-yellow-400";
    case "ERROR":
      return "text-red-600 dark:text-red-400";
    case "INFO":
    default:
      return "text-blue-600 dark:text-blue-400";
  }
};

/**
 * Utility function to get icon for log type
 */
const getLogTypeIcon = (type: LogType | null): string => {
  switch (type) {
    case "SUCCESS":
      return "✓";
    case "WARNING":
      return "⚠";
    case "ERROR":
      return "✗";
    case "INFO":
    default:
      return "ℹ";
  }
};

/**
 * Hook to get log statistics
 */
export const useLogStats = () => {
  return useQuery({
    queryKey: ["log-stats"],
    queryFn: () => apiCall("/logs/stats"),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Utility hook to filter logs by type
 */
export const useFilteredLogs = (
  logs: Log[] | undefined,
  filterType?: LogType
) => {
  if (!logs) return [];
  if (!filterType) return logs;

  return logs.filter((log) => log.type === filterType);
};

/**
 * Utility hook to search logs by content
 */
export const useSearchLogs = (logs: Log[] | undefined, searchTerm: string) => {
  if (!logs || !searchTerm.trim()) return logs || [];

  const term = searchTerm.toLowerCase();
  return logs.filter(
    (log) =>
      log.content?.toLowerCase().includes(term) ||
      log.type?.toLowerCase().includes(term)
  );
};
