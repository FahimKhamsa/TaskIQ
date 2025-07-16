'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
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
import { useAdminUsers, useUserManagementOperations } from '@/hooks/api/useAdmin';
import type { AdminUser } from '@/lib/api/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function UserManagement() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [planFilter, setPlanFilter] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    fullName: '',
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    tgId: '',
    plan: 'FREE',
    dailyLimit: 10,
  });

  const { data: usersData, isLoading, error, refetch, isFetching } = useAdminUsers(
    currentPage, 
    20, 
    {
      search: searchTerm,
      planFilter,
      statusFilter: filterStatus === 'all' ? undefined : filterStatus,
    }
  );

  const { suspendUser, deleteUser, updateUser, createUser } = useUserManagementOperations();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

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

  const filteredUsers = users.filter((user: AdminUser) => {
    const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status?.toLowerCase() === filterStatus;
    const matchesPlan = planFilter === '' || user.planType === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleRefresh = () => {
    // Force refresh by invalidating cache
    refetch();
  };

  const handleForceRefresh = () => {
    // Force refresh with cache bypass
    const { data: freshData } = useAdminUsers(
      currentPage, 
      20, 
      {
        search: searchTerm,
        planFilter,
        statusFilter: filterStatus === 'all' ? undefined : filterStatus,
        forceRefresh: true,
      }
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title and header
      doc.setFontSize(20);
      doc.text('TaskIQ - User Management Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Total Users: ${stats.totalUsers}`, 20, 40);
      
      // Add statistics summary
      doc.setFontSize(14);
      doc.text('User Statistics:', 20, 55);
      doc.setFontSize(10);
      doc.text(`Active Users: ${stats.activeUsers}`, 25, 65);
      doc.text(`Inactive Users: ${stats.inactiveUsers}`, 25, 72);
      doc.text(`Suspended Users: ${stats.suspendedUsers}`, 25, 79);
      
      // Add filters applied
      if (searchTerm || planFilter || filterStatus !== 'all') {
        doc.setFontSize(12);
        doc.text('Filters Applied:', 20, 95);
        doc.setFontSize(10);
        let yPos = 105;
        if (searchTerm) {
          doc.text(`Search: "${searchTerm}"`, 25, yPos);
          yPos += 7;
        }
        if (planFilter) {
          doc.text(`Plan: ${planFilter}`, 25, yPos);
          yPos += 7;
        }
        if (filterStatus !== 'all') {
          doc.text(`Status: ${filterStatus}`, 25, yPos);
          yPos += 7;
        }
      }

      // Prepare table data
      const tableData = filteredUsers.map((user: any) => [
        user.fullName || 'Unknown',
        user.email,
        user.planType,
        user.status,
        user.totalPrompts.toString(),
        `$${user.totalSpent.toFixed(2)}`,
        user.remainingCredits.toString(),
        `${user.credit?.dailyLimit || 0}`,
        user.activeIntegrations?.join(', ') || 'None',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'
      ]);

      // Add table
      autoTable(doc, {
        head: [['Name', 'Email', 'Plan', 'Status', 'Prompts/Day', 'Spent', 'Credits Left', 'Credit Limit', 'Integrations', 'Joined']],
        body: tableData,
        startY: searchTerm || planFilter || filterStatus !== 'all' ? 120 : 90,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [15, 15, 15],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Name
          1: { cellWidth: 35 }, // Email
          2: { cellWidth: 15 }, // Plan
          3: { cellWidth: 15 }, // Status
          4: { cellWidth: 15 }, // Prompts
          5: { cellWidth: 15 }, // Spent
          6: { cellWidth: 15 }, // Credits Left
          7: { cellWidth: 15 }, // Credit Limit
          8: { cellWidth: 25 }, // Integrations
          9: { cellWidth: 20 }, // Joined
        },
        margin: { top: 20, right: 10, bottom: 20, left: 10 },
      });

      // Add footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount} | TaskIQ Admin Dashboard`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const filename = `TaskIQ_Users_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export users. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddUser = async () => {
    try {
      await createUser.mutateAsync(newUserData);
      
      // Reset form and close dialog
      setNewUserData({
        email: '',
        fullName: '',
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        tgId: '',
        plan: 'FREE',
        dailyLimit: 10,
      });
      setIsAddUserDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Add user error:', error);
    }
  };

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setIsViewDetailsDialogOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setNewUserData({
      email: user.email || '',
      fullName: user.fullName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      tgId: user.tgId || '',
      plan: user.planType || 'FREE',
      dailyLimit: user.credit?.dailyLimit || 10,
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUser.mutateAsync({
        userId: selectedUser.id,
        userData: newUserData,
      });
      
      // Reset form and close dialog
      setNewUserData({
        email: '',
        fullName: '',
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        tgId: '',
        plan: 'FREE',
        dailyLimit: 10,
      });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Update user error:', error);
    }
  };

  const handleSuspendUser = async (user: AdminUser) => {
    const isSuspended = user.status?.toLowerCase() === 'suspended';
    const actionText = isSuspended ? 'unsuspend' : 'suspend';
    
    if (confirm(`Are you sure you want to ${actionText} ${user.fullName || user.email}?`)) {
      try {
        await suspendUser.mutateAsync({
          userId: user.id,
          action: isSuspended ? 'unsuspend' : 'suspend',
        });
      } catch (error) {
        // Error handling is done in the hook
        console.error(`${actionText} user error:`, error);
      }
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete ${user.fullName || user.email}? This action cannot be undone.`)) {
      try {
        await deleteUser.mutateAsync(user.id);
      } catch (error) {
        // Error handling is done in the hook
        console.error('Delete user error:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setNewUserData(prev => ({
      ...prev,
      [field]: value
    }));
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
            disabled={isLoading || isFetching}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading || isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={isExporting}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-gray-100">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f0f0f] border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new user account with the specified details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newUserData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Doe"
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUserData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUserData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1234567890"
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newUserData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="tgId">Telegram ID</Label>
                  <Input
                    id="tgId"
                    value={newUserData.tgId}
                    onChange={(e) => handleInputChange('tgId', e.target.value)}
                    placeholder="@username"
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <Select 
                    value={newUserData.plan} 
                    onValueChange={(value) => handleInputChange('plan', value)}
                  >
                    <SelectTrigger className="bg-[#0f0f0f] border-gray-700 text-white">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f0f] border-gray-700">
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="dailyLimit">Daily Credit Limit</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={newUserData.dailyLimit}
                    onChange={(e) => handleInputChange('dailyLimit', parseInt(e.target.value) || 0)}
                    placeholder="10"
                    min="0"
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddUserDialogOpen(false)}
                  className="border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddUser}
                  disabled={!newUserData.email || createUser.isPending}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  {createUser.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {createUser.isPending ? 'Creating...' : 'Add User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                filteredUsers.map((user: AdminUser) => (
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
                      <Badge variant="outline" className={getStatusColor(user.status?.toLowerCase() || 'active')}>
                        {user.status?.toLowerCase() || 'active'}
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
                          <DropdownMenuItem 
                            onClick={() => handleViewDetails(user)}
                            className="text-gray-300 focus:text-white focus:bg-gray-800"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEditUser(user)}
                            className="text-gray-300 focus:text-white focus:bg-gray-800"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem 
                            onClick={() => handleSuspendUser(user)}
                            disabled={suspendUser.isPending}
                            className="text-gray-300 focus:text-white focus:bg-gray-800"
                          >
                            {suspendUser.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Ban className="mr-2 h-4 w-4" />
                            )}
                            {user.status?.toLowerCase() === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)}
                            disabled={deleteUser.isPending}
                            className="text-red-400 focus:text-red-300 focus:bg-gray-800"
                          >
                            {deleteUser.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
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

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about the selected user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Full Name</Label>
                  <p className="text-white">{selectedUser.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-white">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Telegram ID</Label>
                  <p className="text-white">{selectedUser.tgId || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Plan</Label>
                  <Badge variant="outline" className={getPlanColor(selectedUser.planType)}>
                    {selectedUser.planType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedUser.status?.toLowerCase() || 'active')}>
                    {selectedUser.status?.toLowerCase() || 'active'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-400">Daily Prompts</Label>
                  <p className="text-white">{selectedUser.totalPrompts}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Total Spent</Label>
                  <p className="text-white">${selectedUser.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Credits Remaining</Label>
                  <p className="text-white">{selectedUser.remainingCredits} of {selectedUser.credit?.dailyLimit || 0}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Joined Date</Label>
                  <p className="text-white">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Active Integrations</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser.activeIntegrations && selectedUser.activeIntegrations.length > 0 ? (
                    selectedUser.activeIntegrations.map((integration: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-blue-700 text-blue-400">
                        {integration}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">No active integrations</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDetailsDialogOpen(false)}
              className="border-gray-700 text-gray-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user account information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={newUserData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-fullName">Full Name</Label>
              <Input
                id="edit-fullName"
                value={newUserData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-firstName">First Name</Label>
              <Input
                id="edit-firstName"
                value={newUserData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-lastName">Last Name</Label>
              <Input
                id="edit-lastName"
                value={newUserData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={newUserData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1234567890"
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={newUserData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-tgId">Telegram ID</Label>
              <Input
                id="edit-tgId"
                value={newUserData.tgId}
                onChange={(e) => handleInputChange('tgId', e.target.value)}
                placeholder="@username"
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-plan">Plan</Label>
              <Select 
                value={newUserData.plan} 
                onValueChange={(value) => handleInputChange('plan', value)}
              >
                <SelectTrigger className="bg-[#0f0f0f] border-gray-700 text-white">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-gray-700">
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-dailyLimit">Daily Credit Limit</Label>
              <Input
                id="edit-dailyLimit"
                type="number"
                value={newUserData.dailyLimit}
                onChange={(e) => handleInputChange('dailyLimit', parseInt(e.target.value) || 0)}
                placeholder="10"
                min="0"
                className="bg-[#0f0f0f] border-gray-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditUserDialogOpen(false);
                setSelectedUser(null);
              }}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={!newUserData.email || updateUser.isPending}
              className="bg-white text-black hover:bg-gray-100"
            >
              {updateUser.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              {updateUser.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
