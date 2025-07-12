import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MessageSquare, RefreshCw, Users, Eye } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'normal';
  status: 'pending' | 'completed' | 'cancelled';
  allocated_to_team: string;
  allocated_to_agent: string;
  created_by: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface TaskRemark {
  id: string;
  task_id: string;
  remark: string;
  updated_by: string;
  created_at: string;
}

interface ManagementTeam {
  id: string;
  name: string;
  description: string;
}

interface ViewTasksProps {
  taskType: 'pending' | 'completed';
}

export const ViewTasks = ({ taskType }: ViewTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [managementTeams, setManagementTeams] = useState<ManagementTeam[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskRemarks, setTaskRemarks] = useState<TaskRemark[]>([]);
  const [newRemark, setNewRemark] = useState('');
  const [remarkBy, setRemarkBy] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', taskType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setFilteredTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchManagementTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('management_teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setManagementTeams(data || []);
    } catch (error) {
      console.error('Error fetching management teams:', error);
    }
  };

  const fetchTaskRemarks = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_remarks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaskRemarks(data || []);
    } catch (error) {
      console.error('Error fetching task remarks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchManagementTeams();
  }, [taskType]);

  useEffect(() => {
    let filtered = tasks;

    // Filter by date
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(task => {
        const taskDate = format(new Date(task.created_at), 'yyyy-MM-dd');
        return taskDate === selectedDateStr;
      });
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedDate, priorityFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTeamName = (teamId: string) => {
    const team = managementTeams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });

      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const addTaskRemark = async () => {
    if (!newRemark.trim() || !remarkBy.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both remark and your name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('task_remarks')
        .insert([{
          task_id: selectedTask?.id,
          remark: newRemark,
          updated_by: remarkBy
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Remark added successfully",
      });

      setNewRemark('');
      setRemarkBy('');
      fetchTaskRemarks(selectedTask?.id || '');
    } catch (error) {
      console.error('Error adding remark:', error);
      toast({
        title: "Error",
        description: "Failed to add remark",
        variant: "destructive",
      });
    }
  };

  const openRemarksDialog = (task: Task) => {
    setSelectedTask(task);
    setRemarksDialogOpen(true);
    fetchTaskRemarks(task.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Filter by Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "All dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(undefined)}
              className="mt-1 text-xs"
            >
              Clear date filter
            </Button>
          )}
        </div>

        <div>
          <Label>Filter by Priority</Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={fetchTasks} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No {taskType} tasks found matching your filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <strong>Created:</strong> {format(new Date(task.created_at), 'PPP')}
                  </div>
                  {task.due_date && (
                    <div>
                      <strong>Due Date:</strong> {format(new Date(task.due_date), 'PPP')}
                    </div>
                  )}
                  {task.created_by && (
                    <div>
                      <strong>Created By:</strong> {task.created_by}
                    </div>
                  )}
                  {task.allocated_to_team && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <strong>Allocated Team:</strong> {getTeamName(task.allocated_to_team)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {taskType === 'pending' && (
                    <Select
                      value={task.status}
                      onValueChange={(value) => updateTaskStatus(task.id, value as 'pending' | 'completed' | 'cancelled')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRemarksDialog(task)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Remarks ({taskRemarks.filter(r => r.task_id === task.id).length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Remarks Dialog */}
      <Dialog open={remarksDialogOpen} onOpenChange={setRemarksDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Remarks: {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              View task progress and add new remarks
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Task Details */}
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Task Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Status:</strong> {selectedTask?.status}</div>
                <div><strong>Priority:</strong> {selectedTask?.priority}</div>
                {selectedTask?.allocated_to_team && (
                  <div><strong>Allocated Team:</strong> {getTeamName(selectedTask.allocated_to_team)}</div>
                )}
                {selectedTask?.due_date && (
                  <div><strong>Due Date:</strong> {format(new Date(selectedTask.due_date), 'PPP')}</div>
                )}
              </div>
            </div>

            {/* Add New Remark - Only show for pending tasks */}
            {taskType === 'pending' && (
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Add New Remark</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="remarkBy">Your Name</Label>
                    <Input
                      id="remarkBy"
                      value={remarkBy}
                      onChange={(e) => setRemarkBy(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newRemark">Remark</Label>
                    <Textarea
                      id="newRemark"
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      placeholder="Enter your remark about task progress or updates"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addTaskRemark} size="sm">
                    Add Remark
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Remarks */}
            <div>
              <h3 className="font-medium mb-2">Task Progress History</h3>
              {taskRemarks.length === 0 ? (
                <p className="text-gray-500 text-sm">No remarks yet.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {taskRemarks.map((remark) => (
                    <div key={remark.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{remark.updated_by}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(remark.created_at), 'PPP p')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{remark.remark}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarksDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
