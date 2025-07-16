'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

// Admin email - using existing database user
const ADMIN_EMAIL = 'charlie.brown@example.com';

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = () => {
    // Check if admin is already logged in (using localStorage)
    const adminLoggedIn = localStorage.getItem('admin_logged_in');
    const adminEmail = localStorage.getItem('admin_email');
    const adminUserId = localStorage.getItem('admin_user_id');
    
    if (adminLoggedIn === 'true' && adminEmail && adminUserId) {
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      setShowLogin(true);
      setIsAdmin(false);
    }
    
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Check if user exists in database
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginData.email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store admin session in localStorage
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_email', result.user.email);
        localStorage.setItem('admin_user_id', result.user.id);
        localStorage.setItem('admin_user_name', result.user.fullName || result.user.email);
        
        setIsAdmin(true);
        setShowLogin(false);
        setLoginError('');
      } else {
        setLoginError(result.error || 'User not found or not authorized for admin access');
      }
    } catch (error) {
      setLoginError('Failed to verify user. Please try again.');
      console.error('Login error:', error);
    }
    
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_email');
    
    setIsAdmin(false);
    setShowLogin(true);
    router.push('/login');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-white mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-[#0f0f0f] border-gray-800">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to access the TaskIQ Admin Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ email: e.target.value })}
                  placeholder="charlie.brown@example.com"
                  className="bg-[#0f0f0f] border-gray-700 text-white"
                  required
                />
              </div>
              
              <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                <p className="font-medium text-gray-300 mb-1">Available Admin Emails:</p>
                <ul className="space-y-1 text-xs">
                  <li>• charlie.brown@example.com</li>
                  <li>• diana.prince@example.com</li>
                  <li>• ethan.hunt@example.com</li>
                  <li>• bob.johnson@example.com</li>
                </ul>
              </div>
              
              {loginError && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{loginError}</span>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Sign In with Email'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-[#0f0f0f] border-gray-800">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-gray-400">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-4">
              Only users with admin privileges can access this area.
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Sign Out
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and is admin - show the admin content
  return <>{children}</>;
}
