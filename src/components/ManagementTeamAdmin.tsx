
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
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  agent_id: string;
  created_at: string;
  agents: {
    id: string;
    name: string;
    role: string;
  };
}

export const ManagementTeamAdmin = () => {
  const [teams, setTeams] = useState<ManagementTeam[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ManagementTeam | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[]
  });
  const [selectedAgent, setSelectedAgent] = useState('');
  const [manualMemberName, setManualMemberName] = useState('');
  const [manualMemberRole, setManualMemberRole] = useState('');
  
  const { agents } = useSupabaseHierarchy();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
    fetchTeamMembers();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('management_teams')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch management teams",
        variant: "destructive",
      });
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('management_team_members')
        .select(`
          *,
          agents (
            id,
            name,
            role
          )
        `);
        
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
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
      let teamId: string;

      if (editingTeam) {
        // Update existing team
        const { error } = await supabase
          .from('management_teams')
          .update({
            name: formData.name,
            description: formData.description
          })
          .eq('id', editingTeam.id);

        if (error) throw error;
        teamId = editingTeam.id;

        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        // Create new team
        const { data, error } = await supabase
          .from('management_teams')
          .insert([{
            name: formData.name,
            description: formData.description
          }])
          .select()
          .single();

        if (error) throw error;
        teamId = data.id;
        
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }

      // Update team members
      if (editingTeam) {
        // Delete existing members
        await supabase
          .from('management_team_members')
          .delete()
          .eq('team_id', teamId);
      }

      // Add new members
      if (formData.members.length > 0) {
        const memberInserts = formData.members.map(agentId => ({
          team_id: teamId,
          agent_id: agentId
        }));

        const { error: membersError } = await supabase
          .from('management_team_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      resetForm();
      fetchTeams();
      fetchTeamMembers();
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
      fetchTeamMembers();
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
    setManualMemberName('');
    setManualMemberRole('');
    setEditingTeam(null);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleEdit = (team: ManagementTeam) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      members: getTeamMemberIds(team.id)
    });
    setIsEditDialogOpen(true);
  };

  const getTeamMemberIds = (teamId: string): string[] => {
    return teamMembers
      .filter(member => member.team_id === teamId)
      .map(member => member.agent_id);
  };

  const getTeamMembers = (teamId: string) => {
    return teamMembers.filter(member => member.team_id === teamId);
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

  const addManualMember = async () => {
    if (!manualMemberName.trim() || !manualMemberRole.trim()) {
      toast({
        title: "Error",
        description: "Please enter both name and role for the manual member",
        variant: "destructive",
      });
      return;
    }

    // Validate role
    const validRoles = ['coordinator', 'supervisor', 'group-leader', 'pro'];
    if (!validRoles.includes(manualMemberRole)) {
      toast({
        title: "Error",
        description: "Please select a valid role",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new agent entry
      const { data: newAgent, error } = await supabase
        .from('agents')
        .insert({
          name: manualMemberName.trim(),
          role: manualMemberRole as 'coordinator' | 'supervisor' | 'group-leader' | 'pro',
          panchayath_id: '00000000-0000-0000-0000-000000000000' // Default for manual entries
        })
        .select()
        .single();

      if (error) throw error;

      // Add to form members
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, newAgent.id]
      }));

      setManualMemberName('');
      setManualMemberRole('');

      toast({
        title: "Success",
        description: "Manual member added successfully",
      });

      // Refresh agents list
      window.location.reload(); // Simple refresh to update the agents list
    } catch (error) {
      console.error('Error adding manual member:', error);
      toast({
        title: "Error",
        description: "Failed to add manual member",
        variant: "destructive",
      });
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

        {/* Manual Member Addition */}
        <div className="mt-4 p-3 border rounded-lg bg-muted/30">
          <Label className="text-sm font-medium">Add New Member Manually</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            <Input
              placeholder="Member name"
              value={manualMemberName}
              onChange={(e) => setManualMemberName(e.target.value)}
            />
            <Select value={manualMemberRole} onValueChange={setManualMemberRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="group-leader">Group Leader</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              onClick={addManualMember} 
              disabled={!manualMemberName.trim() || !manualMemberRole}
              size="sm"
            >
              Add Manual Member
            </Button>
          </div>
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
        {teams.map((team) => {
          const members = getTeamMembers(team.id);
          return (
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
                  <p className="text-sm font-medium">Members ({members.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {members.length > 0 ? (
                      members.map((member) => (
                        <Badge key={member.id} variant="outline">
                          {member.agents.name} ({member.agents.role})
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No members assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
