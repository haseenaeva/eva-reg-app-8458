import { useState } from "react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Edit, Trash2, Plus, ZoomIn, ZoomOut, ChevronDown, ChevronUp, UserPlus, List, Workflow, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface HorizontalOrganizationChartProps {
  panchayathId: string;
  agents: Agent[];
  panchayathName: string;
  onRefresh: () => void;
}

interface ExpandedNodes {
  [key: string]: boolean;
}

// Color schemes for different supervisors and their subordinates
const supervisorColors = [
  {
    supervisor: 'bg-yellow-200 border-yellow-300 text-yellow-800',
    groupLeader: 'bg-yellow-100 border-yellow-200 text-yellow-700',
    pro: 'bg-yellow-50 border-yellow-150 text-yellow-600'
  },
  {
    supervisor: 'bg-orange-200 border-orange-300 text-orange-800',
    groupLeader: 'bg-orange-100 border-orange-200 text-orange-700',
    pro: 'bg-orange-50 border-orange-150 text-orange-600'
  },
  {
    supervisor: 'bg-green-200 border-green-300 text-green-800',
    groupLeader: 'bg-green-100 border-green-200 text-green-700',
    pro: 'bg-green-50 border-green-150 text-green-600'
  },
  {
    supervisor: 'bg-blue-200 border-blue-300 text-blue-800',
    groupLeader: 'bg-blue-100 border-blue-200 text-blue-700',
    pro: 'bg-blue-50 border-blue-150 text-blue-600'
  },
  {
    supervisor: 'bg-purple-200 border-purple-300 text-purple-800',
    groupLeader: 'bg-purple-100 border-purple-200 text-purple-700',
    pro: 'bg-purple-50 border-purple-150 text-purple-600'
  },
  {
    supervisor: 'bg-pink-200 border-pink-300 text-pink-800',
    groupLeader: 'bg-pink-100 border-pink-200 text-pink-700',
    pro: 'bg-pink-50 border-pink-150 text-pink-600'
  }
];

export const HorizontalOrganizationChart = ({
  panchayathId,
  agents,
  panchayathName,
  onRefresh
}: HorizontalOrganizationChartProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const { toast } = useToast();

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleDoubleClick = (nodeId: string) => {
    const subordinates = getSubordinates(nodeId);
    if (subordinates.length > 0) {
      toggleNode(nodeId);
    }
  };

  const handleViewDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setDetailsDialogOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    toast({
      title: "Edit Feature",
      description: `Edit functionality for ${agent.name} will be implemented`,
    });
  };

  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const getRoleColor = (agent: Agent) => {
    if (agent.role === 'coordinator') {
      return 'bg-blue-300 border-blue-400 text-blue-900';
    }
    
    // Find supervisor for this agent
    let supervisorId = null;
    if (agent.role === 'supervisor') {
      supervisorId = agent.id;
    } else if (agent.superior_id) {
      const superior = agents.find(a => a.id === agent.superior_id);
      if (superior?.role === 'supervisor') {
        supervisorId = superior.id;
      } else if (superior?.superior_id) {
        const grandSuperior = agents.find(a => a.id === superior.superior_id);
        if (grandSuperior?.role === 'supervisor') {
          supervisorId = grandSuperior.id;
        }
      }
    }
    
    if (supervisorId) {
      const supervisors = agents.filter(a => a.role === 'supervisor');
      const supervisorIndex = supervisors.findIndex(s => s.id === supervisorId);
      const colorScheme = supervisorColors[supervisorIndex % supervisorColors.length];
      
      switch (agent.role) {
        case 'supervisor':
          return colorScheme.supervisor;
        case 'group-leader':
          return colorScheme.groupLeader;
        case 'pro':
          return colorScheme.pro;
        default:
          return 'bg-gray-100 border-gray-200 text-gray-800';
      }
    }
    
    return 'bg-gray-100 border-gray-200 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coordinator':
        return 'Coordinator';
      case 'supervisor':
        return 'Supervisor';
      case 'group-leader':
        return 'Group Leader';
      case 'pro':
        return 'P.R.O';
      default:
        return role;
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

  const AgentCard = ({ agent, level = 0 }: { agent: Agent; level?: number; }) => {
    const subordinates = getSubordinates(agent.id);
    const hasSubordinates = subordinates.length > 0;
    const isExpanded = expandedNodes[agent.id] ?? false;
    const cardColors = getRoleColor(agent);

    return (
      <div className="flex flex-col items-center">
        <Card 
          className={`${cardColors} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer min-w-fit max-w-xs`}
          onDoubleClick={() => hasSubordinates && handleDoubleClick(agent.id)}
        >
          <CardContent className="p-4 text-center relative">
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(agent);
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditAgent(agent);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAgent(agent);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="mt-2">
              <User className="h-5 w-5 mx-auto mb-2 text-gray-700" />
              <h3 className="font-semibold text-sm mb-2 break-words">{agent.name}</h3>
              <Badge className="text-xs mb-3 bg-white/50 text-gray-800 border-white/30">
                {getRoleLabel(agent.role)}
              </Badge>
            </div>
            
            {hasSubordinates && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <Badge variant="outline" className="text-xs bg-white/30 text-gray-700 border-white/50">
                  {subordinates.length} subordinate{subordinates.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(agent.id);
                  }}
                  className="h-8 w-full text-xs bg-white/20 border-white/30 hover:bg-white/40"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Lines and Subordinates */}
        {hasSubordinates && isExpanded && (
          <div className="flex flex-col items-center mt-4">
            {/* Vertical line down */}
            <div className="w-0.5 h-6 bg-gray-400"></div>
            
            {/* Horizontal connector */}
            {subordinates.length > 1 && (
              <div className="flex items-center">
                <div className="h-0.5 bg-gray-400" style={{ width: `${(subordinates.length - 1) * 200}px` }}></div>
              </div>
            )}
            
            {/* Individual connection points and subordinates */}
            <div className="flex items-start" style={{ gap: '200px' }}>
              {subordinates.map((subordinate, index) => (
                <div key={subordinate.id} className="flex flex-col items-center">
                  {/* Vertical line up to subordinate */}
                  <div className="w-0.5 h-6 bg-gray-400"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full -mt-1 mb-2"></div>
                  <AgentCard agent={subordinate} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const TableView = () => {
    const buildHierarchyData = (parentId: string | null = null, level: number = 0): any[] => {
      const children = agents.filter(agent => agent.superior_id === parentId);
      let result: any[] = [];
      
      children.forEach(agent => {
        result.push({
          ...agent,
          level,
          subordinates: getSubordinates(agent.id).length
        });
        result = [...result, ...buildHierarchyData(agent.id, level + 1)];
      });
      
      return result;
    };

    const hierarchyData = buildHierarchyData();

    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Subordinates</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hierarchyData.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div className={`flex items-center ${agent.level > 0 ? `ml-${agent.level * 4}` : ''}`}>
                    <span style={{ marginLeft: `${agent.level * 16}px` }}>{agent.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(agent)}>
                    {getRoleLabel(agent.role)}
                  </Badge>
                </TableCell>
                <TableCell>{agent.level + 1}</TableCell>
                <TableCell>{agent.subordinates}</TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs">
                    {agent.email && <div>{agent.email}</div>}
                    {agent.phone && <div>{agent.phone}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAgent(agent)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setAgentToDelete(agent);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const coordinators = agents.filter(agent => agent.role === 'coordinator');

  if (agents.length === 0) {
    return (
      <div className="text-center py-12 bg-white">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600 mb-4">No agents have been added to this panchayath yet.</p>
        <Link to="/add-agents">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Agent
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white">
      {/* Controls Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-white rounded-lg shadow-md border">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Hierarchy Controls</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allAgentIds = agents.map(agent => agent.id);
                const allExpanded = allAgentIds.reduce((acc, id) => ({
                  ...acc,
                  [id]: true
                }), {});
                setExpandedNodes(allExpanded);
              }}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedNodes({})}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Collapse All
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              disabled={zoomLevel <= 0.5}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
              disabled={zoomLevel >= 2}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(1)}
              className="text-xs px-2 h-8"
            >
              Reset
            </Button>
          </div>
          
          <Link to="/add-agents">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Panchayath Header */}
      <div className="bg-gray-800 text-white p-8 rounded-xl shadow-xl text-center border">
        <h1 className="text-4xl font-bold mb-3 tracking-wide text-blue-400">{panchayathName.toUpperCase()}</h1>
        <div className="text-gray-300 text-lg">Organization Hierarchy</div>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{agents.filter(a => a.role === 'coordinator').length}</div>
            <div className="text-gray-400">Coordinators</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{agents.filter(a => a.role === 'supervisor').length}</div>
            <div className="text-gray-400">Supervisors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{agents.filter(a => a.role === 'group-leader').length}</div>
            <div className="text-gray-400">Group Leaders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{agents.filter(a => a.role === 'pro').length}</div>
            <div className="text-gray-400">P.R.Os</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          Double-click on cards to expand/collapse • Click eye icon to view details • Use expand buttons
        </div>
      </div>

      {/* Tabs for Chart and Table View */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Chart View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Table View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="mt-6">
          <div className="bg-white p-8 rounded-xl overflow-auto shadow-xl border">
            <div
              className="flex justify-center transition-transform duration-300 ease-in-out"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center top'
              }}
            >
              <div className="flex flex-col items-center gap-12">
                {coordinators.map(coordinator => (
                  <AgentCard key={coordinator.id} agent={coordinator} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="table" className="mt-6">
          <div className="bg-white p-6 rounded-xl shadow-xl border">
            <TableView />
          </div>
        </TabsContent>
      </Tabs>

      {/* Agent Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Agent Details
            </DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedAgent.name}</h3>
                <Badge className={getRoleColor(selectedAgent)}>
                  {getRoleLabel(selectedAgent.role)}
                </Badge>
              </div>
              
              {selectedAgent.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{selectedAgent.email}</span>
                </div>
              )}
              
              {selectedAgent.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{selectedAgent.phone}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                <p>Created: {new Date(selectedAgent.created_at).toLocaleDateString()}</p>
                <p>Subordinates: {getSubordinates(selectedAgent.id).length}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedAgent) {
                  handleEditAgent(selectedAgent);
                  setDetailsDialogOpen(false);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {agentToDelete?.name}? This action cannot be undone.
              {agentToDelete && getSubordinates(agentToDelete.id).length > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Warning: This agent has {getSubordinates(agentToDelete.id).length} subordinate(s) who will become unassigned.
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
