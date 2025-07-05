'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

export default function LogsViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const logs = [
    {
      id: 1,
      timestamp: "2025-01-20 14:32:15",
      level: "info",
      message: "User john@example.com created calendar event",
      user: "john@example.com",
      service: "Calendar",
      ip: "192.168.1.100"
    },
    {
      id: 2,
      timestamp: "2025-01-20 14:31:45",
      level: "warning",
      message: "Rate limit exceeded for user jane@example.com",
      user: "jane@example.com",
      service: "API Gateway",
      ip: "192.168.1.101"
    },
    {
      id: 3,
      timestamp: "2025-01-20 14:30:22",
      level: "error",
      message: "Gmail API connection failed for user bob@example.com",
      user: "bob@example.com",
      service: "Gmail",
      ip: "192.168.1.102"
    },
    {
      id: 4,
      timestamp: "2025-01-20 14:29:33",
      level: "info",
      message: "User alice@example.com updated profile information",
      user: "alice@example.com",
      service: "Profile",
      ip: "192.168.1.103"
    },
    {
      id: 5,
      timestamp: "2025-01-20 14:28:17",
      level: "success",
      message: "Payment processed successfully for user charlie@example.com",
      user: "charlie@example.com",
      service: "Billing",
      ip: "192.168.1.104"
    },
    {
      id: 6,
      timestamp: "2025-01-20 14:27:59",
      level: "warning",
      message: "High memory usage detected on server node-2",
      user: "system",
      service: "System",
      ip: "internal"
    },
    {
      id: 7,
      timestamp: "2025-01-20 14:26:41",
      level: "error",
      message: "Database connection timeout",
      user: "system",
      service: "Database",
      ip: "internal"
    },
    {
      id: 8,
      timestamp: "2025-01-20 14:25:30",
      level: "info",
      message: "User david@example.com logged in successfully",
      user: "david@example.com",
      service: "Authentication",
      ip: "192.168.1.105"
    }
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'border-green-800 text-green-400';
      case 'info': return 'border-blue-800 text-blue-400';
      case 'warning': return 'border-yellow-800 text-yellow-400';
      case 'error': return 'border-red-800 text-red-400';
      default: return 'border-gray-700 text-gray-400';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const logStats = {
    total: logs.length,
    success: logs.filter(log => log.level === 'success').length,
    info: logs.filter(log => log.level === 'info').length,
    warning: logs.filter(log => log.level === 'warning').length,
    error: logs.filter(log => log.level === 'error').length
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">System Logs</h1>
          <p className="text-gray-400 mt-1">Monitor system events and user activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-white">{logStats.total}</div>
            <p className="text-sm text-gray-400">Total Logs</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-green-500">{logStats.success}</div>
            <p className="text-sm text-gray-400">Success</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-blue-500">{logStats.info}</div>
            <p className="text-sm text-gray-400">Info</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-yellow-500">{logStats.warning}</div>
            <p className="text-sm text-gray-400">Warnings</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-red-500">{logStats.error}</div>
            <p className="text-sm text-gray-400">Errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Logs</CardTitle>
          <CardDescription className="text-gray-400">System events and user activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Level
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0f0f0f] border-gray-700">
                <DropdownMenuItem onClick={() => setFilterLevel('all')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  All Levels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('success')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('info')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Info
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('warning')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Warning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('error')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Error
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Logs List */}
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getLevelColor(log.level)}>
                        {log.level}
                      </Badge>
                      <span className="text-sm font-medium text-white">{log.service}</span>
                    </div>
                    <span className="text-sm text-gray-400">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{log.message}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>User: {log.user}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No logs found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}