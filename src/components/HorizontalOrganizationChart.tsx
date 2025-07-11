import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, User, Mail, Phone, RefreshCw } from "lucide-react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface HorizontalOrganizationChartProps {
  panchayathId: string;
  agents: Agent[];
  panchayathName: string;
  onRefresh: () => void;
}
export const HorizontalOrganizationChart = ({
  panchayathId,
  agents,
  panchayathName,
  onRefresh
}: HorizontalOrganizationChartProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string>('');
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ward: ''
  });
  const {
    toast
  } = useToast();
  const roleHierarchy = {
    'coordinator': 1,
    'supervisor': 2,
    'group-leader': 3,
    'pro': 4
  } as const;
  const getAgentsByRole = (role: Agent['role']) => {
    return agents.filter(agent => agent.role === role);
  };
  const coordinators = getAgentsByRole('coordinator');
  const supervisors = getAgentsByRole('supervisor');
  const groupLeaders = getAgentsByRole('group-leader');
  const pros = getAgentsByRole('pro');
  const unassignedAgents = agents.filter(agent => {
    if (agent.role === 'coordinator') return false;
    const hasSuperior = agents.some(superior => superior.id === agent.superior_id);
    return !hasSuperior;
  });
  const deleteAgent = async (agentId: string) => {
    try {
      const {
        error
      } = await supabase.from('agents').delete().eq('id', agentId);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Agent deleted successfully"
      });
      onRefresh();
      setDeleteDialogOpen(false);
      setAgentToDelete('');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive"
      });
    }
  };
  const updateAgent = async () => {
    if (!agentToEdit) return;
    try {
      const {
        error
      } = await supabase.from('agents').update({
        name: editFormData.name,
        email: editFormData.email || null,
        phone: editFormData.phone || null,
        ward: editFormData.ward || null
      }).eq('id', agentToEdit.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Agent updated successfully"
      });
      onRefresh();
      setEditDialogOpen(false);
      setAgentToEdit(null);
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error",
        description: "Failed to update agent",
        variant: "destructive"
      });
    }
  };
  const getRoleColor = (role: Agent['role']) => {
    switch (role) {
      case 'coordinator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      // Changed from green to purple for better readability
      case 'group-leader':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pro':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const AgentCard = ({
    agent,
    level = 0
  }: {
    agent: Agent;
    level?: number;
  }) => <Card className="mb-2 shadow-sm border hover:shadow-md transition-shadow min-w-64"> {/* Reduced card size */}
      <CardHeader className="pb-2 pt-3 px-3"> {/* Reduced padding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" /> {/* Smaller icon */}
            <CardTitle className="text-sm font-medium">{agent.name}</CardTitle> {/* Smaller text */}
          </div>
          <div className="flex items-center gap-1">
            <Badge className={`text-xs px-2 py-1 ${getRoleColor(agent.role)}`}>
              {agent.role.charAt(0).toUpperCase() + agent.role.slice(1).replace('-', ' ')}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" // Smaller buttons
            onClick={() => {
              setAgentToEdit(agent);
              setEditFormData({
                name: agent.name,
                email: agent.email || '',
                phone: agent.phone || '',
                ward: agent.ward || ''
              });
              setEditDialogOpen(true);
            }}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:text-red-700" onClick={() => {
              setAgentToDelete(agent.id);
              setDeleteDialogOpen(true);
            }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-2"> {/* Reduced padding */}
        <div className="space-y-1">
          {agent.ward && <div className="text-xs text-gray-600">Ward: {agent.ward}</div>}
          <div className="flex gap-3 text-xs text-gray-600"> {/* Smaller text */}
            {agent.email && <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-24">{agent.email}</span>
              </div>}
            {agent.phone && <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="text-red-700">{agent.phone}</span>
              </div>}
          </div>
        </div>
      </CardContent>
    </Card>;
  if (agents.length === 0) {
    return <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600 mb-4">No agents have been added to {panchayathName} yet.</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{panchayathName}</h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"> {/* Reduced gap */}
        <div className="text-center p-3 bg-blue-50 rounded-lg"> {/* Reduced padding */}
          <div className="text-xl font-bold text-blue-600">{coordinators.length}</div>
          <div className="text-xs text-gray-600">Coordinators</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">{supervisors.length}</div>
          <div className="text-xs text-gray-600">Supervisors</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-600">{groupLeaders.length}</div>
          <div className="text-xs text-gray-600">Group Leaders</div>
        </div>
        <div className="text-center p-3 bg-pink-50 rounded-lg">
          <div className="text-xl font-bold text-pink-600">{pros.length}</div>
          <div className="text-xs text-gray-600">P.R.Os</div>
        </div>
      </div>

      {/* Hierarchy Display */}
      <div className="space-y-4 max-h-96 overflow-y-auto"> {/* Added max height and scroll */}
        {coordinators.map(coordinator => <div key={coordinator.id} className="space-y-2">
            <AgentCard agent={coordinator} />
            <div className="ml-8 space-y-2">
              {supervisors.filter(s => s.superior_id === coordinator.id).map(supervisor => <div key={supervisor.id} className="space-y-2">
                    <AgentCard agent={supervisor} level={1} />
                    <div className="ml-8 space-y-2">
                      {groupLeaders.filter(gl => gl.superior_id === supervisor.id).map(groupLeader => <div key={groupLeader.id} className="space-y-2">
                            <AgentCard agent={groupLeader} level={2} />
                            <div className="ml-8 space-y-1">
                              {pros.filter(pro => pro.superior_id === groupLeader.id).map(pro => <AgentCard key={pro.id} agent={pro} level={3} />)}
                            </div>
                          </div>)}
                    </div>
                  </div>)}
            </div>
          </div>)}
      </div>

      {unassignedAgents.length > 0 && <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Unassigned Agents</h3>
          <div className="grid gap-2">
            {unassignedAgents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteAgent(agentToDelete)}>
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update the agent's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editFormData.name} onChange={e => setEditFormData(prev => ({
              ...prev,
              name: e.target.value
            }))} placeholder="Agent name" />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={editFormData.email} onChange={e => setEditFormData(prev => ({
              ...prev,
              email: e.target.value
            }))} placeholder="Email address" />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={editFormData.phone} onChange={e => setEditFormData(prev => ({
              ...prev,
              phone: e.target.value
            }))} placeholder="Phone number" />
            </div>
            <div>
              <Label htmlFor="edit-ward">Ward</Label>
              <Input id="edit-ward" value={editFormData.ward} onChange={e => setEditFormData(prev => ({
              ...prev,
              ward: e.target.value
            }))} placeholder="Ward number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateAgent}>
              Update Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};