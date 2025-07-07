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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Crown
} from 'lucide-react';
import { useAdminLogs, useCreateLog, useUpdateLog, useDeleteLog } from '@/hooks/api/useAdmin';
import type { LogType, CreateLogRequest, UpdateLogRequest } from '@/lib/api/types';

export default function LogsViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [newLogData, setNewLogData] = useState<CreateLogRequest>({
    type: 'INFO',
    content: '',
    isPremium: false,
  });

  const filters = {
    type: filterLevel || undefined,
    search: searchTerm || undefined,
  };

  const { data: logsData, isLoading, error, refetch } = useAdminLogs(currentPage, 50, filters);
  const createLogMutation = useCreateLog();
  const updateLogMutation = useUpdateLog();
  const deleteLogMutation = useDeleteLog();

  const logs = logsData?.logs || [];
  const stats = logsData?.stats || { overall: {}, filtered: {}, total: 0, filteredTotal: 0 };
  const pagination = logsData?.pagination || { page: 1, limit: 50, total: 0, pages: 1 };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'success': return 'border-green-800 text-green-400';
      case 'info': return 'border-blue-800 text-blue-400';
      case 'warning': return 'border-yellow-800 text-yellow-400';
      case 'error': return 'border-red-800 text-red-400';
      default: return 'border-gray-700 text-gray-400';
    }
  };

  const handleCreateLog = async () => {
    try {
      await createLogMutation.mutateAsync(newLogData);
      setIsCreateDialogOpen(false);
      setNewLogData({ type: 'INFO', content: '', isPremium: false });
    } catch (error) {
      console.error('Error creating log:', error);
    }
  };

  const handleUpdateLog = async () => {
    if (!editingLog) return;
    
    try {
      const updateData: UpdateLogRequest = {
        id: editingLog.id,
        type: editingLog.type,
        content: editingLog.content,
        isPremium: editingLog.isPremium,
      };
      await updateLogMutation.mutateAsync(updateData);
      setIsEditDialogOpen(false);
      setEditingLog(null);
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (confirm('Are you sure you want to delete this log entry?')) {
      try {
        await deleteLogMutation.mutateAsync(logId);
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const logStats = {
    total: stats.overall.INFO + stats.overall.SUCCESS + stats.overall.WARNING + stats.overall.ERROR || 0,
    success: stats.overall.SUCCESS || 0,
    info: stats.overall.INFO || 0,
    warning: stats.overall.WARNING || 0,
    error: stats.overall.ERROR || 0
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
            Export Logs
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Add Log
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f0f0f] border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Log Entry</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new log entry to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Log Type</Label>
                  <Select 
                    value={newLogData.type} 
                    onValueChange={(value: LogType) => setNewLogData({...newLogData, type: value})}
                  >
                    <SelectTrigger className="bg-[#0f0f0f] border-gray-700 text-white">
                      <SelectValue placeholder="Select log type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f0f] border-gray-700">
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newLogData.content}
                    onChange={(e) => setNewLogData({...newLogData, content: e.target.value})}
                    placeholder="Enter log message..."
                    className="bg-[#0f0f0f] border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={newLogData.isPremium}
                    onChange={(e) => setNewLogData({...newLogData, isPremium: e.target.checked})}
                    className="rounded border-gray-700"
                  />
                  <Label htmlFor="isPremium" className="flex items-center">
                    <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                    Premium Action
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateLog}
                  disabled={createLogMutation.isPending || !newLogData.content}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  {createLogMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Log
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-white">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : logStats.total.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Total Logs</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-green-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : logStats.success.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Success</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-blue-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : logStats.info.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Info</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-yellow-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : logStats.warning.toLocaleString()}
            </div>
            <p className="text-sm text-gray-400">Warnings</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold text-red-500">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : logStats.error.toLocaleString()}
            </div>
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
                <DropdownMenuItem onClick={() => setFilterLevel('')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  All Levels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('SUCCESS')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('INFO')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Info
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('WARNING')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Warning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('ERROR')} className="text-gray-300 focus:text-white focus:bg-gray-800">
                  Error
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Logs List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-400 mt-2">Loading logs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400">Error loading logs: {error.message}</p>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  className="mt-2 border-gray-700 text-gray-300"
                >
                  Try Again
                </Button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No logs found matching your search criteria.</p>
              </div>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.displayType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getLevelColor(log.displayType)}>
                          {log.displayType}
                        </Badge>
                        {log.isPremiumAction && (
                          <Badge variant="outline" className="border-yellow-700 text-yellow-400">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{log.formattedTime}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-gray-700">
                            <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingLog(log);
                                setIsEditDialogOpen(true);
                              }}
                              className="text-gray-300 focus:text-white focus:bg-gray-800"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Log
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-red-400 focus:text-red-300 focus:bg-gray-800"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Log
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{log.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>User: {log.userDisplay}</span>
                      <span>ID: {log.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-400">
                Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} logs
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-700 text-gray-300"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="border-gray-700 text-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Log Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Log Entry</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the log entry details.
            </DialogDescription>
          </DialogHeader>
          {editingLog && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-type">Log Type</Label>
                <Select 
                  value={editingLog.type} 
                  onValueChange={(value: LogType) => setEditingLog({...editingLog, type: value})}
                >
                  <SelectTrigger className="bg-[#0f0f0f] border-gray-700 text-white">
                    <SelectValue placeholder="Select log type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-gray-700">
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingLog.content}
                  onChange={(e) => setEditingLog({...editingLog, content: e.target.value})}
                  placeholder="Enter log message..."
                  className="bg-[#0f0f0f] border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPremium"
                  checked={editingLog.isPremium}
                  onChange={(e) => setEditingLog({...editingLog, isPremium: e.target.checked})}
                  className="rounded border-gray-700"
                />
                <Label htmlFor="edit-isPremium" className="flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                  Premium Action
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingLog(null);
              }}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateLog}
              disabled={updateLogMutation.isPending || !editingLog?.content}
              className="bg-white text-black hover:bg-gray-100"
            >
              {updateLogMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              Update Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
