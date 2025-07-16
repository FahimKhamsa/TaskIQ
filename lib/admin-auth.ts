import { NextRequest } from "next/server";

// List of emails that can access admin panel
const ADMIN_EMAILS = [
  'charlie.brown@example.com',
  'diana.prince@example.com', 
  'ethan.hunt@example.com',
  'bob.johnson@example.com'
];

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export function verifyAdminAuth(request: NextRequest): AdminUser | null {
  try {
    // Get admin info from headers (sent by client)
    const adminEmail = request.headers.get('x-admin-email');
    const adminUserId = request.headers.get('x-admin-user-id');
    const adminUserName = request.headers.get('x-admin-user-name');

    if (!adminEmail || !adminUserId) {
      return null;
    }

    // Check if email is in allowed admin emails
    if (!ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      return null;
    }

    return {
      id: adminUserId,
      email: adminEmail,
      name: adminUserName || adminEmail
    };
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return null;
  }
}

export function createUnauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized - Admin access required" },
    { status: 401 }
  );
}
