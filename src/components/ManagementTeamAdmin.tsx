import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, X } from "lucide-react";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";

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

interface Agent {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

interface FormData {
  name: string;
  description: string;
  members: string[];
}

export const ManagementTeamAdmin = () => {
  const [teams, setTeams] = useState<ManagementTeam[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ManagementTeam | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [manualMemberName, setManualMemberName] = useState('');
  const [manualMemberMobile, setManualMemberMobile] = useState('');
  const [manualMemberPanchayath, setManualMemberPanchayath] = useState('');
  const [panchayaths, setPanchayaths] = useState<Array<{id: string, name: string, district: string, state: string}>>([]);
  
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      members: []
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, setValue, watch, reset, formState } = form;
  const formValues = watch();

  const fetchData = useCallback(async () => {
    await Promise.all([fetchTeams(), fetchTeamMembers(), fetchAgents(), fetchPanchayaths()]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAMS)
        .select('*')
        .order('name');
        
      if (error) throw error;
      setTeams((data as any) || []);
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
      const { data, error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAM_MEMBERS)
        .select(`
          *,
          agents (
            id,
            name,
            role
          )
        `);
        
      if (error) throw error;
      setTeamMembers((data as any) || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.AGENTS)
        .select('id, name, role, email, phone')
        .order('name');
        
      if (error) throw error;
      setAgents((data as any) || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive",
      });
    }
  };

  const fetchPanchayaths = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.PANCHAYATHS)
        .select('id, name, district, state')
        .order('name');
        
      if (error) throw error;
      setPanchayaths((data as any) || []);
    } catch (error) {
      console.error('Error fetching panchayaths:', error);
      toast({
        title: "Error",
        description: "Failed to fetch panchayaths",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!data.name.trim()) {
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
        const { error } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAMS)
          .update({
            name: data.name,
            description: data.description
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
        const { data: teamData, error } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAMS)
          .insert([{
            name: data.name,
            description: data.description
          }])
          .select()
          .single();

        if (error) throw error;
        teamId = teamData.id;
        
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }

      // Update team members
      if (editingTeam) {
        // Delete existing members
        await typedSupabase
          .from(TABLES.MANAGEMENT_TEAM_MEMBERS)
          .delete()
          .eq('team_id', teamId);
      }

      // Add new members
      if (data.members.length > 0) {
        const memberInserts = data.members.map(agentId => ({
          team_id: teamId,
          agent_id: agentId
        }));

        const { error: membersError } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAM_MEMBERS)
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      resetForm();
      fetchData();
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
      const { error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAMS)
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      
      fetchData();
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
    reset({
      name: '',
      description: '',
      members: []
    });
    setSelectedAgent('');
    setManualMemberName('');
    setManualMemberMobile('');
    setManualMemberPanchayath('');
    setEditingTeam(null);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleEdit = (team: ManagementTeam) => {
    setEditingTeam(team);
    reset({
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
    if (selectedAgent && !formValues.members.includes(selectedAgent)) {
      setValue('members', [...formValues.members, selectedAgent]);
      setSelectedAgent('');
    }
  };

  const addManualMember = async () => {
    if (!manualMemberName.trim() || !manualMemberMobile.trim() || !manualMemberPanchayath) {
      toast({
        title: "Error",
        description: "Please enter name, mobile number and select panchayath",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new agent entry
      const { data: newAgent, error } = await typedSupabase
        .from(TABLES.AGENTS)
        .insert({
          name: manualMemberName.trim(),
          phone: manualMemberMobile.trim(),
          role: 'coordinator', // Default role for management team members
          panchayath_id: manualMemberPanchayath
        })
        .select()
        .single();

      if (error) throw error;

      // Add to form members
      setValue('members', [...formValues.members, newAgent.id]);

      setManualMemberName('');
      setManualMemberMobile('');
      setManualMemberPanchayath('');

      toast({
        title: "Success",
        description: "Manual member added successfully",
      });

      // Refresh agents list
      fetchAgents();
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
    setValue('members', formValues.members.filter(id => id !== agentId));
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.name} (${agent.role})` : 'Unknown Agent';
  };

  const TeamForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Team Name *</Label>
        <Input
          id="name"
          {...register('name', { required: true })}
          placeholder="Enter team name"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
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
                .filter(agent => !formValues.members.includes(agent.id))
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
          {formValues.members.map((agentId) => (
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
              placeholder="Member name *"
              value={manualMemberName}
              onChange={(e) => setManualMemberName(e.target.value)}
            />
            <Input
              placeholder="Mobile number *"
              value={manualMemberMobile}
              onChange={(e) => setManualMemberMobile(e.target.value)}
            />
            <Select value={manualMemberPanchayath} onValueChange={setManualMemberPanchayath}>
              <SelectTrigger>
                <SelectValue placeholder="Select panchayath *" />
              </SelectTrigger>
              <SelectContent>
                {panchayaths.map((panchayath) => (
                  <SelectItem key={panchayath.id} value={panchayath.id}>
                    {panchayath.name} - {panchayath.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              onClick={addManualMember} 
              disabled={!manualMemberName.trim() || !manualMemberMobile.trim() || !manualMemberPanchayath}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

      <div className="grid gap-4 max-h-[70vh] overflow-y-auto">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Management Team</DialogTitle>
            <DialogDescription>
              Update the management team details and members.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <TeamForm />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};