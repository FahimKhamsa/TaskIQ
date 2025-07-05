'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ChevronDown
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+2.3%",
      changeType: "increase",
      icon: Users,
      description: "Active users this month"
    },
    {
      title: "Monthly Revenue",
      value: "$47,392",
      change: "+12.4%",
      changeType: "increase",
      icon: DollarSign,
      description: "Revenue this month"
    },
    {
      title: "API Calls",
      value: "1.2M",
      change: "+8.7%",
      changeType: "increase",
      icon: Activity,
      description: "Total API calls this month"
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "-0.5%",
      changeType: "decrease",
      icon: TrendingUp,
      description: "Free to paid conversion"
    }
  ];

  const topCommands = [
    { command: "Calendar Event", count: 45678, change: "+12%" },
    { command: "Send Email", count: 32145, change: "+8%" },
    { command: "Get Location", count: 28934, change: "+15%" },
    { command: "Fitness Data", count: 21876, change: "+5%" },
    { command: "Weather Info", count: 18765, change: "+3%" }
  ];

  const recentUsers = [
    { name: "John Doe", email: "john@example.com", plan: "Professional", joined: "2 hours ago" },
    { name: "Jane Smith", email: "jane@example.com", plan: "Starter", joined: "5 hours ago" },
    { name: "Bob Johnson", email: "bob@example.com", plan: "Enterprise", joined: "1 day ago" },
    { name: "Alice Brown", email: "alice@example.com", plan: "Professional", joined: "1 day ago" },
    { name: "Charlie Wilson", email: "charlie@example.com", plan: "Starter", joined: "2 days ago" }
  ];

  const systemHealth = [
    { service: "API Gateway", status: "healthy", uptime: "99.9%" },
    { service: "Database", status: "healthy", uptime: "99.8%" },
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
          <Badge variant="outline" className="border-green-800 text-green-400">
            All Systems Operational
          </Badge>
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
            <CardDescription className="text-gray-400">Popular commands this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCommands.map((command, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{command.command}</p>
                      <p className="text-sm text-gray-400">{command.count.toLocaleString()} uses</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChevronUp className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-green-500">{command.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
            <CardDescription className="text-gray-400">New user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 border border-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
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
                    <p className="text-xs text-gray-500">{user.joined}</p>
                  </div>
                </div>
              ))}
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
            {systemHealth.map((service, index) => (
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
    </div>
  );
}