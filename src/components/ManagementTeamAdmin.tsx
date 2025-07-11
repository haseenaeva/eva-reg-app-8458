
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";

interface ManagementTeam {
  id: string;
  name: string;
  description: string;
  members: string[];
}

export const ManagementTeamAdmin = () => {
  const [teams, setTeams] = useState<ManagementTeam[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ManagementTeam | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });
  const [selectedAgent, setSelectedAgent] = useState('');
  
  const { agents } = useSupabaseHierarchy();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('management_teams')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // For now, we'll store members as a JSON array in description field
      // In a real implementation, you'd want a separate junction table
      const teamsWithMembers = (data || []).map(team => ({
        ...team,
        members: team.description ? JSON.parse(team.description).members || [] : []
      }));
      
      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch management teams",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const teamData = {
        name: formData.name,
        description: JSON.stringify({
          description: formData.description,
          members: formData.members
        })
      };

      if (editingTeam) {
        const { error } = await supabase
          .from('management_teams')
          .update(teamData)
          .eq('id', editingTeam.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('management_teams')
          .insert([teamData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }

      resetForm();
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Error",
        description: "Failed to save team",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('management_teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      members: []
    });
    setSelectedAgent('');
    setEditingTeam(null);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleEdit = (team: ManagementTeam) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      members: team.members
    });
    setIsEditDialogOpen(true);
  };

  const addMember = () => {
    if (selectedAgent && !formData.members.includes(selectedAgent)) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, selectedAgent]
      }));
      setSelectedAgent('');
    }
  };

  const removeMember = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(id => id !== agentId)
    }));
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.name} (${agent.role})` : 'Unknown Agent';
  };

  const TeamForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Team Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter team name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter team description"
          rows={3}
        />
      </div>

      <div>
        <Label>Team Members</Label>
        <div className="flex gap-2 mb-2">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents
                .filter(agent => !formData.members.includes(agent.id))
                .map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={addMember} disabled={!selectedAgent}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {formData.members.map((agentId) => (
            <Badge key={agentId} variant="secondary" className="flex items-center gap-1">
              {getAgentName(agentId)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => removeMember(agentId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={resetForm}>
          Cancel
        </Button>
        <Button type="submit">
          {editingTeam ? 'Update Team' : 'Create Team'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Management Teams</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Management Team</DialogTitle>
              <DialogDescription>
                Create a new management team and assign agents to it.
              </DialogDescription>
            </DialogHeader>
            <TeamForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>
                    {team.description || 'No description provided'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Members ({team.members.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {team.members.length > 0 ? (
                    team.members.map((agentId) => (
                      <Badge key={agentId} variant="outline">
                        {getAgentName(agentId)}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No members assigned</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Management Team</DialogTitle>
            <DialogDescription>
              Update the management team details and members.
            </DialogDescription>
          </DialogHeader>
          <TeamForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};
