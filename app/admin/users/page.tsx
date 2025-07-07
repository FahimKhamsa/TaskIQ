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
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  UserPlus,
  Download,
  Eye,
  Edit,
  Ban,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAdminUsers } from '@/hooks/api/useAdmin';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [planFilter, setPlanFilter] = useState('');

  const { data: usersData, isLoading, error, refetch } = useAdminUsers(currentPage, 20);

  const users = usersData?.users || [];
  const stats = usersData?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    suspendedUsers: 0,
  };
  const pagination = usersData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'border-blue-800 text-blue-400';
      case 'PRO': return 'border-purple-800 text-purple-400';
      case 'ENTERPRISE': return 'border-orange-800 text-orange-400';
      default: return 'border-gray-700 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-800 text-green-400';
      case 'inactive': return 'border-yellow-800 text-yellow-400';
      case 'suspended': return 'border-red-800 text-red-400';
      default: return 'border-gray-700 text-gray-400';
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesPlan = planFilter === '' || user.planType === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage and monitor user accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-white text-black hover:bg-gray-100">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-white">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Total Users</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-green-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.activeUsers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Active Users</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-yellow-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.inactiveUsers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Inactive Users</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-red-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.suspendedUsers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Suspended Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">User List</CardTitle>
          <CardDescription className="text-gray-400">Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0f0f0f] border-gray-700">
                <DropdownMenuItem onClick={() => setFilterStatus('all')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  All Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('inactive')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('suspended')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Suspended
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Plan
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0f0f0f] border-gray-700">
                <DropdownMenuItem onClick={() => setPlanFilter('')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  All Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlanFilter('FREE')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Free
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlanFilter('PRO')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Pro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPlanFilter('ENTERPRISE')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Enterprise
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Analytics</TableHead>
                <TableHead className="text-gray-400">Credits</TableHead>
                <TableHead className="text-gray-400">Integrations</TableHead>
                <TableHead className="text-gray-400">Joined</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-400 mt-2">Loading users...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-red-400">Error loading users: {error.message}</p>
                    <Button 
                      variant="outline" 
                      onClick={handleRefresh}
                      className="mt-2 border-gray-700 text-gray-300"
                    >
                      Try Again
                    </Button>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-gray-500">No users found matching your search criteria.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-gray-800">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{user.fullName || 'Unknown User'}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPlanColor(user.planType)}>
                        {user.planType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-white">{user.totalPrompts} prompts/day</div>
                        <div className="text-gray-500">${user.totalSpent.toFixed(2)} spent</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-white">{user.remainingCredits}</div>
                        <div className="text-gray-500">of {user.credit?.dailyLimit || 0}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.activeIntegrations && user.activeIntegrations.length > 0 ? (
                          user.activeIntegrations.slice(0, 2).map((integration: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs border-blue-700 text-blue-400">
                              {integration}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                        {user.activeIntegrations && user.activeIntegrations.length > 2 && (
                          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                            +{user.activeIntegrations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-gray-700">
                          <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-800">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-800">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-800">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-gray-800">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

        </CardContent>
      </Card>
    </div>
  );
}
