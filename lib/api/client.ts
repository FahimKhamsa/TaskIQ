import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * Generic API client for making authenticated requests to internal Next.js API routes
 * Automatically handles Supabase session authentication
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get admin authentication info from localStorage for admin routes
  const isAdminRoute = endpoint.startsWith('/admin');
  let adminHeaders = {};
  
  if (isAdminRoute && typeof window !== 'undefined') {
    const adminEmail = localStorage.getItem('admin_email');
    const adminUserId = localStorage.getItem('admin_user_id');
    const adminUserName = localStorage.getItem('admin_user_name');
    
    if (adminEmail && adminUserId) {
      adminHeaders = {
        'x-admin-email': adminEmail,
        'x-admin-user-id': adminUserId,
        'x-admin-user-name': adminUserName || adminEmail,
      };
    }
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session && { Authorization: `Bearer ${session.access_token}` }),
      ...adminHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string) => apiCall<T>(endpoint),

  post: <T>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) => apiCall<T>(endpoint, { method: "DELETE" }),
};
