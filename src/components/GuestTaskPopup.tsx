import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { CalendarDays, Clock, User } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  created_at: string;
}

interface GuestTaskPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mobileNumber: string;
}

export const GuestTaskPopup = ({ isOpen, onClose, mobileNumber }: GuestTaskPopupProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mobileNumber) {
      fetchUserTasks();
    }
  }, [isOpen, mobileNumber]);

  const fetchUserTasks = async () => {
    setLoading(true);
    try {
      // First, find the agent by mobile number
      const { data: agent, error: agentError } = await typedSupabase
        .from(TABLES.AGENTS)
        .select('id')
        .eq('phone', mobileNumber)
        .maybeSingle();

      if (agentError) throw agentError;

      if (agent) {
        // Fetch tasks allocated to this agent
        const { data: agentTasks, error: tasksError } = await typedSupabase
          .from(TABLES.TASKS)
          .select('*')
          .eq('allocated_to_agent', agent.id)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(agentTasks || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Allocated Tasks
          </DialogTitle>
          <DialogDescription>
            Tasks assigned to your mobile number: {mobileNumber}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No tasks allocated to your mobile number.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {task.description && (
                    <p className="text-muted-foreground mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        Due: {format(parseISO(task.due_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Created: {format(parseISO(task.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};