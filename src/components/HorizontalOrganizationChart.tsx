
import { useState } from "react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Mail, Phone, Edit, Trash2, Plus } from "lucide-react";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const { toast } = useToast();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'supervisor': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'group-leader': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'pro': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coordinator': return 'Coordinator';
      case 'supervisor': return 'Supervisor';
      case 'group-leader': return 'Group Leader';
      case 'pro': return 'P.R.O';
      default: return role;
    }
  };

  const getSubordinates = (agentId: string) => {
    return agents.filter(agent => agent.superior_id === agentId);
  };

  const deleteAgent = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
      
      onRefresh();
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    }
  };

  const AgentCard = ({ agent, level = 0 }: { agent: Agent; level?: number }) => {
    const subordinates = getSubordinates(agent.id);

    return (
      <div className="flex flex-col items-center">
        {/* Agent Box */}
        <Card className={`${getRoleColor(agent.role)} min-w-[200px] shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/20`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <User className="h-4 w-4 opacity-80" />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-red-500/30"
                  onClick={() => {
                    setAgentToDelete(agent);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <h3 className="font-bold text-sm mb-1">{agent.name}</h3>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
              {getRoleLabel(agent.role)}
            </Badge>
            
            {(agent.email || agent.phone) && (
              <div className="mt-2 space-y-1">
                {agent.email && (
                  <div className="flex items-center justify-center gap-1 text-xs opacity-90">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{agent.email}</span>
                  </div>
                )}
                {agent.phone && (
                  <div className="flex items-center justify-center gap-1 text-xs opacity-90">
                    <Phone className="h-3 w-3" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Lines and Subordinates */}
        {subordinates.length > 0 && (
          <div className="flex flex-col items-center mt-4">
            {/* Vertical line down */}
            <div className="w-0.5 h-6 bg-cyan-400"></div>
            
            {/* Horizontal line */}
            <div className="flex items-center">
              <div className={`h-0.5 bg-cyan-400 ${subordinates.length > 1 ? 'w-8' : 'w-0'}`}></div>
              <div className="w-0.5 h-0.5 bg-cyan-400"></div>
              <div className={`h-0.5 bg-cyan-400 ${subordinates.length > 1 ? 'w-8' : 'w-0'}`}></div>
            </div>
            
            {/* Subordinates in horizontal layout */}
            <div className="flex gap-8 mt-6">
              {subordinates.map((subordinate) => (
                <div key={subordinate.id} className="flex flex-col items-center">
                  {/* Vertical line up to subordinate */}
                  <div className="w-0.5 h-6 bg-cyan-400"></div>
                  <AgentCard agent={subordinate} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const coordinators = agents.filter(agent => agent.role === 'coordinator');

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600">No agents have been added to this panchayath yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Panchayath Header with Dark Blue Background */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">{panchayathName.toUpperCase()}</h1>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          ADD NEW AGENTS
        </Button>
      </div>

      {/* Hierarchy Tree */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-lg overflow-x-auto">
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-8">
            {coordinators.map((coordinator) => (
              <AgentCard key={coordinator.id} agent={coordinator} />
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {agentToDelete?.name}? This action cannot be undone.
              {getSubordinates(agentToDelete?.id || '').length > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Warning: This agent has subordinates who will become unassigned.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => agentToDelete && deleteAgent(agentToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
