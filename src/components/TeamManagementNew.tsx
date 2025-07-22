import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Users, X, UserPlus } from "lucide-react";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  panchayath_id: string;
}

interface Panchayath {
  id: string;
  name: string;
  district: string;
  state: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  agent_id: string;
  agents: Agent;
}

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const TeamManagementNew = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [manualMember, setManualMember] = useState({
    name: '',
    mobile: '',
    panchayath_id: '',
    reports_to: ''
  });
  
  const { toast } = useToast();

  const fetchTeams = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAMS)
        .select('*')
        .order('name');
        
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      });
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.AGENTS)
        .select('*')
        .order('name');
        
      if (error) throw error;
      setAgents(data || []);
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
        .select('*')
        .order('name');
        
      if (error) throw error;
      setPanchayaths(data || []);
    } catch (error) {
      console.error('Error fetching panchayaths:', error);
      toast({
        title: "Error",
        description: "Failed to fetch panchayaths",
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
          agents (*)
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

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchTeams(),
        fetchAgents(),
        fetchPanchayaths(),
        fetchTeamMembers()
      ]);
    };
    fetchData();
  }, []);

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
      if (editingTeam) {
        const { error } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAMS)
          .update({
            name: formData.name,
            description: formData.description
          })
          .eq('id', editingTeam.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        const { data: teamData, error } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAMS)
          .insert([{
            name: formData.name,
            description: formData.description
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Add team members
        await handleTeamMembers(teamData.id);
        
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }

      resetForm();
      await Promise.all([fetchTeams(), fetchTeamMembers(), fetchAgents()]);
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Error",
        description: "Failed to save team",
        variant: "destructive",
      });
    }
  };

  const handleTeamMembers = async (teamId: string) => {
    // Add selected existing agents
    if (selectedMembers.length > 0) {
      const memberInserts = selectedMembers.map(agentId => ({
        team_id: teamId,
        agent_id: agentId
      }));

      const { error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAM_MEMBERS)
        .insert(memberInserts);

      if (error) throw error;
    }

    // Add manual member if provided
    if (manualMember.name && manualMember.mobile && manualMember.panchayath_id) {
      // Create new agent
      const { data: newAgent, error: agentError } = await typedSupabase
        .from(TABLES.AGENTS)
        .insert({
          name: manualMember.name,
          phone: manualMember.mobile,
          role: 'coordinator',
          panchayath_id: manualMember.panchayath_id,
          superior_id: manualMember.reports_to || null
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Add to team
      const { error: memberError } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAM_MEMBERS)
        .insert({
          team_id: teamId,
          agent_id: newAgent.id
        });

      if (memberError) throw memberError;
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

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
    setFormData({ name: '', description: '' });
    setSelectedMembers([]);
    setSelectedAgent('');
    setSearchMobile('');
    setManualMember({ name: '', mobile: '', panchayath_id: '', reports_to: '' });
    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || ''
    });
    // Load existing team members
    const existingMembers = teamMembers
      .filter(member => member.team_id === team.id)
      .map(member => member.agent_id);
    setSelectedMembers(existingMembers);
    setIsDialogOpen(true);
  };

  const addSelectedAgent = () => {
    if (selectedAgent && !selectedMembers.includes(selectedAgent)) {
      setSelectedMembers([...selectedMembers, selectedAgent]);
      setSelectedAgent('');
    }
  };

  const removeMember = (agentId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== agentId));
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.name} (${agent.role})` : 'Unknown Agent';
  };

  const getTeamMemberCount = (teamId: string) => {
    return teamMembers.filter(member => member.team_id === teamId).length;
  };

  const getTeamMembersList = (teamId: string) => {
    return teamMembers
      .filter(member => member.team_id === teamId)
      .map(member => member.agents?.name || 'Unknown')
      .slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Team Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTeam(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter team description"
                    rows={3}
                  />
                </div>

                {/* Team Members Section */}
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-base font-semibold">Team Members</Label>
                  
                  {/* Select from existing agents */}
                  <div className="space-y-3 p-4 border rounded-lg bg-background">
                    <Label className="text-sm font-medium">Add from existing agents</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search by mobile number"
                        value={searchMobile}
                        onChange={(e) => setSearchMobile(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                          <SelectContent className="max-h-48 overflow-y-auto bg-background border shadow-md z-50">
                            {agents
                              .filter(agent => !selectedMembers.includes(agent.id))
                              .filter(agent => 
                                !searchMobile || 
                                (agent.phone && agent.phone.includes(searchMobile))
                              )
                              .map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name} ({agent.role}) - {agent.phone || 'No phone'}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" onClick={addSelectedAgent} disabled={!selectedAgent}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Selected members display */}
                  {selectedMembers.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected members ({selectedMembers.length})</Label>
                      <div className="max-h-32 overflow-y-auto p-3 border rounded-md bg-muted/20">
                        <div className="flex flex-wrap gap-2">
                          {selectedMembers.map((agentId) => (
                            <Badge key={agentId} variant="secondary" className="flex items-center gap-1">
                              {getAgentName(agentId)}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeMember(agentId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual member addition */}
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add member manually
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        placeholder="Member name"
                        value={manualMember.name}
                        onChange={(e) => setManualMember({ ...manualMember, name: e.target.value })}
                      />
                      <Input
                        placeholder="Mobile number"
                        value={manualMember.mobile}
                        onChange={(e) => setManualMember({ ...manualMember, mobile: e.target.value })}
                      />
                      <Select 
                        value={manualMember.panchayath_id} 
                        onValueChange={(value) => setManualMember({ ...manualMember, panchayath_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select panchayath" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48 overflow-y-auto bg-background border shadow-md z-50">
                          {panchayaths.map((panchayath) => (
                            <SelectItem key={panchayath.id} value={panchayath.id}>
                              {panchayath.name} - {panchayath.district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={manualMember.reports_to} 
                        onValueChange={(value) => setManualMember({ ...manualMember, reports_to: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team (optional)" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48 overflow-y-auto bg-background border shadow-md z-50">
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTeam ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{team.name}</span>
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
                    onClick={() => handleDelete(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{team.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{getTeamMemberCount(team.id)} members</span>
                </div>
                
                {getTeamMemberCount(team.id) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Members: {getTeamMembersList(team.id).join(', ')}
                    {getTeamMemberCount(team.id) > 3 && ` +${getTeamMemberCount(team.id) - 3} more`}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                Created: {new Date(team.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
        
        {teams.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No teams created yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};