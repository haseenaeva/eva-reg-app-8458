
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
const db = typedSupabase;
import { useToast } from "@/hooks/use-toast";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";
import { MobileAgentSearch } from "@/components/MobileAgentSearch";

interface ManagementTeam {
  id: string;
  name: string;
  description: string;
}

export const AddTaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as 'high' | 'medium' | 'normal',
    dueDate: undefined as Date | undefined,
    allocationType: 'agent' as 'agent' | 'team',
    allocatedToAgent: '',
    allocatedToTeam: ''
  });
  const [managementTeams, setManagementTeams] = useState<ManagementTeam[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { agents } = useSupabaseHierarchy();
  const { toast } = useToast();

  useEffect(() => {
    fetchManagementTeams();
  }, []);

  const fetchManagementTeams = async () => {
    try {
      const { data, error } = await db
        .from('management_teams')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setManagementTeams(data || []);
    } catch (error) {
      console.error('Error fetching management teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch management teams",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        due_date: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : null,
        allocated_to_agent: formData.allocationType === 'agent' ? formData.allocatedToAgent || null : null,
        allocated_to_team: formData.allocationType === 'team' ? formData.allocatedToTeam || null : null,
        status: 'pending' as const,
        created_by: 'Admin' // You can update this to use actual user info
      };

      const { error } = await db
        .from('tasks')
        .insert([taskData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        dueDate: undefined,
        allocationType: 'agent',
        allocatedToAgent: '',
        allocatedToTeam: ''
      });

    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Task
        </CardTitle>
        <CardDescription>
          Add a new task and assign it to an agent or management team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'high' | 'medium' | 'normal') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Allocation Type</Label>
            <Select
              value={formData.allocationType}
              onValueChange={(value: 'agent' | 'team') => 
                setFormData(prev => ({ 
                  ...prev, 
                  allocationType: value,
                  allocatedToAgent: '',
                  allocatedToTeam: ''
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select allocation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Allocate to Agent</SelectItem>
                <SelectItem value="team">Allocate to Management Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.allocationType === 'agent' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobileSearch">Search Agent by Mobile Number</Label>
                <MobileAgentSearch
                  onAgentSelect={(agentId) => setFormData(prev => ({ ...prev, allocatedToAgent: agentId }))}
                  selectedAgentId={formData.allocatedToAgent}
                />
              </div>
              
              <div>
                <Label htmlFor="agent">Or Select from List</Label>
                <Select
                  value={formData.allocatedToAgent}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, allocatedToAgent: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.role}) - {agent.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.allocationType === 'team' && (
            <div>
              <Label htmlFor="team">Select Management Team</Label>
              <Select
                value={formData.allocatedToTeam}
                onValueChange={(value) => setFormData(prev => ({ ...prev, allocatedToTeam: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a management team" />
                </SelectTrigger>
                <SelectContent>
                  {managementTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Task..." : "Create Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
