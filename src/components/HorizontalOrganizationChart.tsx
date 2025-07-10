
import { useState } from "react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Edit, Trash2, Plus, ZoomIn, ZoomOut, ChevronDown, ChevronRight, UserPlus, List, Workflow } from "lucide-react";
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

export const HorizontalOrganizationChart = ({
  panchayathId,
  agents,
  panchayathName,
  onRefresh
}: HorizontalOrganizationChartProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const expandAll = () => {
    const allAgentIds = agents.map(agent => agent.id);
    const allExpanded = allAgentIds.reduce((acc, id) => ({
      ...acc,
      [id]: true
    }), {});
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator':
        return 'bg-purple-600 text-white border-purple-200 shadow-lg';
      case 'supervisor':
        return 'bg-blue-600 text-white border-blue-200 shadow-lg';
      case 'group-leader':
        return 'bg-green-600 text-white border-green-200 shadow-lg';
      case 'pro':
        return 'bg-orange-600 text-white border-orange-200 shadow-lg';
      default:
        return 'bg-gray-600 text-white border-gray-200 shadow-lg';
    }
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
    const isExpanded = expandedNodes[agent.id] ?? true;

    return (
      <div className="flex flex-col items-center">
        {/* Agent Box - Responsive width */}
        <Card className={`${getRoleColor(agent.role)} min-w-fit max-w-xs border-2 hover:shadow-xl transition-all duration-300`}>
          <CardContent className="p-4 text-center relative">
            {/* Expansion Toggle */}
            {hasSubordinates && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNode(agent.id)}
                className="absolute top-2 left-2 h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            )}

            <div className="flex items-center justify-between mb-2">
              <User className="h-4 w-4 opacity-80" />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-red-500/30 rounded-full"
                  onClick={() => {
                    setAgentToDelete(agent);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <h3 className="font-bold text-sm mb-2 break-words px-1">{agent.name}</h3>
            <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-xs mb-3">
              {getRoleLabel(agent.role)}
            </Badge>
            
            {hasSubordinates && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-xs mb-2">
                {subordinates.length} subordinate{subordinates.length !== 1 ? 's' : ''}
              </Badge>
            )}
            
            {(agent.email || agent.phone) && (
              <div className="mt-2 space-y-1">
                {agent.email && (
                  <div className="flex items-center justify-center gap-1 text-xs opacity-90">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[140px]">{agent.email}</span>
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
        {hasSubordinates && isExpanded && (
          <div className="flex flex-col items-center mt-6">
            {/* Vertical line down */}
            <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
            
            {/* Horizontal connector with proper connections */}
            <div className="flex items-center">
              <div className={`h-1 bg-gray-400 rounded-full ${subordinates.length > 1 ? 'w-12' : 'w-0'}`}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full border-2 border-white"></div>
              <div className={`h-1 bg-gray-400 rounded-full ${subordinates.length > 1 ? 'w-12' : 'w-0'}`}></div>
            </div>
            
            {/* Subordinates in horizontal layout with connecting lines */}
            <div className="flex gap-12 mt-8">
              {subordinates.map((subordinate, index) => (
                <div key={subordinate.id} className="flex flex-col items-center">
                  {/* Vertical line up to subordinate */}
                  <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
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
                  <Badge className={getRoleColor(agent.role)}>
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
                    <Button variant="outline" size="sm">
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
              onClick={expandAll}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
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
              onClick={handleZoomOut}
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
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="text-xs px-2 h-8"
            >
              Reset
            </Button>
          </div>
          
          {/* Add Agent Button */}
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
          {/* Hierarchy Tree with Zoom */}
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
