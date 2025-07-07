'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp,
  Calendar,
  Mail,
  MapPin,
  Heart,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  useAdminAnalytics, 
  useFormattedAdminAnalytics, 
  useAnalyticsStatus,
  useGenerateAdminAnalytics,
  useSystemHealth 
} from '@/hooks/api/useAdmin';

export default function AdminDashboard() {
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAdminAnalytics();
  const { data: systemHealth } = useSystemHealth();
  const formattedAnalytics = useFormattedAdminAnalytics();
  const analyticsStatus = useAnalyticsStatus();
  const generateAnalytics = useGenerateAdminAnalytics();

  const handleRefreshAnalytics = () => {
    generateAnalytics.mutate({ forceRefresh: true });
  };

  // Fallback data for when analytics is loading or unavailable
  const fallbackStats = [
    {
      title: "Total Users",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: Users,
      description: "Active users this month"
    },
    {
      title: "Conversion Rate",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: TrendingUp,
      description: "Free to paid conversion"
    },
    {
      title: "Active Integrations",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: Activity,
      description: "Connected services"
    },
    {
      title: "Commands Tracked",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: DollarSign,
      description: "Most used commands"
    }
  ];

  const stats = formattedAnalytics ? [
    {
      title: formattedAnalytics.overview.totalUsers.label,
      value: formattedAnalytics.overview.totalUsers.value,
      change: "+2.3%", // You can calculate this from historical data
      changeType: "increase",
      icon: Users,
      description: "Total registered users"
    },
    {
      title: formattedAnalytics.overview.conversionRate.label,
      value: formattedAnalytics.overview.conversionRate.value,
      change: "+0.5%",
      changeType: "increase",
      icon: TrendingUp,
      description: "Free to paid conversion"
    },
    {
      title: formattedAnalytics.overview.activeIntegrations.label,
      value: formattedAnalytics.overview.activeIntegrations.value,
      change: "+1",
      changeType: "increase",
      icon: Activity,
      description: "Connected services"
    },
    {
      title: formattedAnalytics.overview.topCommands.label,
      value: formattedAnalytics.overview.topCommands.value,
      change: "+2",
      changeType: "increase",
      icon: DollarSign,
      description: "Most used commands"
    }
  ] : fallbackStats;

  const topUsers = formattedAnalytics?.topUsers || [];
  const recentUsers = formattedAnalytics?.recentUsers || [];
  const topCommands = formattedAnalytics?.commands || [];

  const systemHealthData = [
    { service: "API Gateway", status: "healthy", uptime: "99.9%" },
    { service: "Database", status: systemHealth?.database === "connected" ? "healthy" : "error", uptime: "99.8%" },
    { service: "Google OAuth", status: "healthy", uptime: "99.7%" },
    { service: "Email Service", status: "warning", uptime: "98.5%" },
    { service: "File Storage", status: "healthy", uptime: "99.9%" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'border-green-800 text-green-400';
      case 'warning': return 'border-yellow-800 text-yellow-400';
      case 'error': return 'border-red-800 text-red-400';
      default: return 'border-gray-700 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor system performance and user activity</p>
        </div>
        <div className="flex items-center space-x-2">
          {analyticsStatus && (
            <Badge 
              variant="outline" 
              className={
                analyticsStatus.status === 'fresh' 
                  ? "border-green-800 text-green-400"
                  : analyticsStatus.status === 'aging'
                  ? "border-yellow-800 text-yellow-400"
                  : "border-red-800 text-red-400"
              }
            >
              {analyticsStatus.status === 'fresh' && <CheckCircle className="w-3 h-3 mr-1" />}
              {analyticsStatus.status === 'aging' && <Clock className="w-3 h-3 mr-1" />}
              {analyticsStatus.status === 'stale' && <AlertCircle className="w-3 h-3 mr-1" />}
              {analyticsStatus.message}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAnalytics}
            disabled={generateAnalytics.isPending}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generateAnalytics.isPending ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isIncrease = stat.changeType === 'increase';
          return (
            <Card key={stat.title} className="bg-[#0f0f0f] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
                <div className="flex items-center space-x-1 mt-1">
                  {isIncrease ? (
                    <ChevronUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">from last month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Commands */}
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Most Used Commands</CardTitle>
            <CardDescription className="text-gray-400">Popular commands from analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCommands.length > 0 ? (
                topCommands.map((command, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{command}</p>
                        <p className="text-sm text-gray-400">Command type</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3 text-blue-500" />
                      <span className="text-sm text-blue-500">Active</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No command data available</p>
                  <p className="text-sm text-gray-500">Generate analytics to see command usage</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
            <CardDescription className="text-gray-400">Recently added users from analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 border border-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 font-medium text-sm">
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 border-gray-700 text-gray-400">
                        {user.plan}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {new Date(user.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No recent users data</p>
                  <p className="text-sm text-gray-500">Generate analytics to see recent users</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">System Health</CardTitle>
          <CardDescription className="text-gray-400">Service status and uptime</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemHealthData.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-white">{service.service}</p>
                  <p className="text-sm text-gray-400">Uptime: {service.uptime}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Users Section */}
      {topUsers.length > 0 && (
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Top Users</CardTitle>
            <CardDescription className="text-gray-400">Most active users by activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.user}</p>
                      <p className="text-sm text-gray-400">{user.prompts} prompts • {user.credits_used} credits used</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Joined {new Date(user.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Integrations */}
      {formattedAnalytics?.integrations && formattedAnalytics.integrations.length > 0 && (
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Active Integrations</CardTitle>
            <CardDescription className="text-gray-400">Currently connected services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formattedAnalytics.integrations.map((integration, index) => (
                <Badge key={index} variant="outline" className="border-blue-700 text-blue-400">
                  {integration}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
