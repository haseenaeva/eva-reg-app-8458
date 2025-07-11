
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    allocatedToTeam: '',
    createdBy: '',
    dueDate: undefined as Date | undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managementTeams, setManagementTeams] = useState<ManagementTeam[]>([]);
  
  const { toast } = useToast();

  // Fetch management teams on component mount
  React.useEffect(() => {
    const fetchManagementTeams = async () => {
      const { data, error } = await supabase
        .from('management_teams')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching management teams:', error);
      } else {
        setManagementTeams(data || []);
      }
    };
    
    fetchManagementTeams();
  }, []);

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
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          allocated_to_team: formData.allocatedToTeam || null,
          allocated_to_agent: null,
          created_by: formData.createdBy || null,
          due_date: formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : null
        }]);

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
        allocatedToTeam: '',
        createdBy: '',
        dueDate: undefined
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-red-600">High</span>
              </span>
            </SelectItem>
            <SelectItem value="medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-orange-600">Medium</span>
              </span>
            </SelectItem>
            <SelectItem value="normal">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600">Normal</span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="team">Allocated to Management Team</Label>
        <Select value={formData.allocatedToTeam} onValueChange={(value) => setFormData(prev => ({ ...prev, allocatedToTeam: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select management team" />
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

      <div>
        <Label htmlFor="createdBy">Created By</Label>
        <Input
          id="createdBy"
          value={formData.createdBy}
          onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
          placeholder="Enter creator name"
        />
      </div>

      <div>
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Task...
          </>
        ) : (
          'Create Task'
        )}
      </Button>
    </form>
  );
};
