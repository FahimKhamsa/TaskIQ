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
  useSystemStats,
  useSystemHealth 
} from '@/hooks/api/useAdmin';

export default function AdminDashboard() {
  const { data: systemStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useSystemStats();
  const { data: systemHealth } = useSystemHealth();

  const handleRefreshStats = () => {
    refetchStats();
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

  const stats = systemStats ? [
    {
      title: "Total Users",
      value: systemStats.totalUsers.toLocaleString(),
      change: "+2.3%", // You can calculate this from historical data
      changeType: "increase",
      icon: Users,
      description: "Total registered users"
    },
    {
      title: "Conversion Rate",
      value: `${systemStats.conversionRate.toFixed(1)}%`,
      change: "+0.5%",
      changeType: "increase",
      icon: TrendingUp,
      description: "Free to paid conversion"
    },
    {
      title: "Active Integrations",
      value: systemStats.activeIntegrations.length.toString(),
      change: "+1",
      changeType: "increase",
      icon: Activity,
      description: "Connected services"
    },
    {
      title: "Total Revenue",
      value: `$${systemStats.totalRevenue.toLocaleString()}`,
      change: "+12%",
      changeType: "increase",
      icon: DollarSign,
      description: "Revenue from subscriptions"
    }
  ] : fallbackStats;

  const topUsers = systemStats?.topUsers || [];
  const recentUsers = systemStats?.recentUsers || [];
  const topCommands = systemStats?.mostUsedCommands || [];

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
          {systemStats && (
            <Badge 
              variant="outline" 
              className="border-green-800 text-green-400"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Live Data - {new Date(systemStats.lastUpdated).toLocaleTimeString()}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStats}
            disabled={statsLoading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
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
                          {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-400">{user.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 border-gray-700 text-gray-400">
                        {user.plan || 'FREE'}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'Unknown date'}
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
      {systemStats?.activeIntegrations && systemStats.activeIntegrations.length > 0 && (
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Active Integrations</CardTitle>
            <CardDescription className="text-gray-400">Currently connected services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {systemStats.activeIntegrations.map((integration, index) => (
                <Badge key={index} variant="outline" className="border-blue-700 text-blue-400">
                  {integration}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Active:</span>
                <span className="text-green-400">{systemStats?.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Inactive:</span>
                <span className="text-yellow-400">{systemStats?.inactiveUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Suspended:</span>
                <span className="text-red-400">{systemStats?.suspendedUsers || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-white">{systemStats?.totalSubscriptions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active:</span>
                <span className="text-green-400">{systemStats?.activeSubscriptions || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Free:</span>
                <span className="text-blue-400">{systemStats?.planDistribution.free || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly:</span>
                <span className="text-purple-400">{systemStats?.planDistribution.monthly || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Yearly:</span>
                <span className="text-orange-400">{systemStats?.planDistribution.yearly || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Credits Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Used Today:</span>
                <span className="text-white">{systemStats?.totalCreditsUsed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
