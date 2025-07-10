
import { useState } from "react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Edit, Trash2, Plus, ZoomIn, ZoomOut, ChevronDown, ChevronUp, UserPlus, List, Workflow, Eye, Download, FileSpreadsheet, FileText } from "lucide-react";
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

// Supervisor colors for different supervisors
const supervisorColors = [
  { bg: 'bg-yellow-500', border: 'border-yellow-300', text: 'text-yellow-900', accent: 'bg-yellow-500' },
  { bg: 'bg-orange-500', border: 'border-orange-300', text: 'text-orange-900', accent: 'bg-orange-500' },
  { bg: 'bg-emerald-500', border: 'border-emerald-300', text: 'text-emerald-900', accent: 'bg-emerald-500' },
  { bg: 'bg-blue-500', border: 'border-blue-300', text: 'text-blue-900', accent: 'bg-blue-500' },
  { bg: 'bg-purple-500', border: 'border-purple-300', text: 'text-purple-900', accent: 'bg-purple-500' },
  { bg: 'bg-pink-500', border: 'border-pink-300', text: 'text-pink-900', accent: 'bg-pink-500' },
  { bg: 'bg-indigo-500', border: 'border-indigo-300', text: 'text-indigo-900', accent: 'bg-indigo-500' },
  { bg: 'bg-red-500', border: 'border-red-300', text: 'text-red-900', accent: 'bg-red-500' }
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
    // Navigate to edit page with agent ID
    window.location.href = `/add-agents?edit=${agent.id}`;
  };

  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const exportToCSV = () => {
    const hierarchyData = buildHierarchyData();
    const csvContent = [
      ['Name', 'Role', 'Level', 'Subordinates', 'Email', 'Phone', 'Ward'],
      ...hierarchyData.map(agent => [
        agent.name,
        getRoleLabel(agent.role),
        (agent.level + 1).toString(),
        agent.subordinates.toString(),
        agent.email || '',
        agent.phone || '',
        agent.ward || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${panchayathName}_hierarchy.csv`;
    link.click();
    
    toast({
      title: "Export Successful",
      description: "Hierarchy data exported to CSV",
    });
  };

  const exportToPDF = () => {
    // For PDF export, we'll create a formatted text version
    const hierarchyData = buildHierarchyData();
    let pdfContent = `${panchayathName} - Organization Hierarchy\n\n`;
    
    hierarchyData.forEach(agent => {
      const indent = '  '.repeat(agent.level);
      pdfContent += `${indent}${agent.name} - ${getRoleLabel(agent.role)}\n`;
      if (agent.email) pdfContent += `${indent}  Email: ${agent.email}\n`;
      if (agent.phone) pdfContent += `${indent}  Phone: ${agent.phone}\n`;
      if (agent.ward) pdfContent += `${indent}  Ward: ${agent.ward}\n`;
      pdfContent += '\n';
    });

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${panchayathName}_hierarchy.txt`;
    link.click();
    
    toast({
      title: "Export Successful",
      description: "Hierarchy data exported to text file",
    });
  };

  const getSupervisorColorScheme = (agent: Agent) => {
    const supervisors = agents.filter(a => a.role === 'supervisor');
    const supervisorIndex = supervisors.findIndex(s => s.id === agent.id);
    if (supervisorIndex !== -1) {
      return supervisorColors[supervisorIndex % supervisorColors.length];
    }
    return null;
  };

  const getRoleColor = (agent: Agent) => {
    if (agent.role === 'coordinator') {
      return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 text-white shadow-lg shadow-blue-200/50';
    }
    
    if (agent.role === 'supervisor') {
      const colorScheme = getSupervisorColorScheme(agent);
      if (colorScheme) {
        return `bg-gradient-to-br from-gray-100 to-gray-200 ${colorScheme.border} text-gray-900 shadow-lg shadow-gray-200/50`;
      }
      return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-900 shadow-lg shadow-gray-200/50';
    }
    
    if (agent.role === 'group-leader') {
      return 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white shadow-lg shadow-green-200/50';
    }
    
    if (agent.role === 'pro') {
      return 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 text-white shadow-lg shadow-orange-200/50';
    }
    
    return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200 text-gray-800 shadow-lg';
  };

  const getSupervisorAccentColor = (agent: Agent) => {
    if (agent.role === 'supervisor') {
      return null;
    }

    // Find the supervisor this agent reports to
    let supervisorId = null;
    if (agent.superior_id) {
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
      if (supervisorIndex !== -1) {
        return supervisorColors[supervisorIndex % supervisorColors.length].accent;
      }
    }
    
    return null;
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

  const AgentCard = ({ agent, level = 0 }: { agent: Agent; level?: number; }) => {
    const subordinates = getSubordinates(agent.id);
    const hasSubordinates = subordinates.length > 0;
    const isExpanded = expandedNodes[agent.id] ?? false;
    const cardColors = getRoleColor(agent);
    const accentColor = getSupervisorAccentColor(agent);

    return (
      <div className="flex flex-col items-center">
        <Card 
          className={`${cardColors} border-2 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer min-w-[280px] sm:min-w-[320px] max-w-xs relative overflow-hidden transform hover:-translate-y-1`}
          onDoubleClick={() => hasSubordinates && handleDoubleClick(agent.id)}
        >
          {/* Supervisor accent color corner */}
          {accentColor && (
            <div className={`absolute top-0 right-0 w-8 h-8 ${accentColor} transform rotate-45 translate-x-4 -translate-y-4 shadow-lg`}></div>
          )}
          
          <CardContent className="p-4 sm:p-6 text-center relative">
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(agent);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditAgent(agent);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-red-500/20 rounded-full backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAgent(agent);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-2">
              <User className="h-6 w-6 mx-auto mb-3 text-white/90" />
              {/* Shining effect for name and position */}
              <div className="relative">
                <h3 className="font-bold text-base sm:text-lg mb-3 break-words text-white drop-shadow-lg relative">
                  <span className="relative z-10">{agent.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
                </h3>
                <Badge className="text-xs sm:text-sm mb-4 bg-white/90 text-gray-800 border-white/50 font-semibold shadow-lg relative overflow-hidden">
                  <span className="relative z-10">{getRoleLabel(agent.role)}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 animate-pulse delay-300"></div>
                </Badge>
              </div>
            </div>
            
            {hasSubordinates && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {subordinates.length} subordinate{subordinates.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(agent.id);
                  }}
                  className="h-12 w-full text-sm bg-white/20 border-white/30 hover:bg-white/30 font-medium text-white backdrop-blur-sm transition-all duration-300"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-5 w-5 mr-2" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-5 w-5 mr-2" />
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
          <div className="flex flex-col items-center mt-6">
            {/* Vertical line down */}
            <div className="w-0.5 h-8 bg-gray-400"></div>
            
            {/* Horizontal connector */}
            {subordinates.length > 1 && (
              <div className="flex items-center">
                <div className="h-0.5 bg-gray-400" style={{ width: `${Math.min((subordinates.length - 1) * 200, window.innerWidth - 100)}px` }}></div>
              </div>
            )}
            
            {/* Individual connection points and subordinates */}
            <div className="flex items-start gap-4 sm:gap-8 lg:gap-12 xl:gap-16 flex-wrap justify-center">
              {subordinates.map((subordinate, index) => (
                <div key={subordinate.id} className="flex flex-col items-center">
                  {/* Vertical line up to subordinate */}
                  <div className="w-0.5 h-8 bg-gray-400"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full -mt-1 mb-4"></div>
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
    const hierarchyData = buildHierarchyData();

    return (
      <div className="w-full">
        {/* Export buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export TXT
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Role</TableHead>
                <TableHead className="min-w-[80px]">Level</TableHead>
                <TableHead className="min-w-[100px]">Subordinates</TableHead>
                <TableHead className="min-w-[200px]">Contact</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchyData.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <span style={{ marginLeft: `${agent.level * 16}px` }} className="font-medium">
                        {agent.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs px-2 py-1 ${
                      agent.role === 'coordinator' ? 'bg-blue-100 text-blue-800' :
                      agent.role === 'supervisor' ? 'bg-gray-100 text-gray-800' :
                      agent.role === 'group-leader' ? 'bg-green-100 text-green-800' :
                      agent.role === 'pro' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getRoleLabel(agent.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{agent.level + 1}</TableCell>
                  <TableCell className="text-center">{agent.subordinates}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {agent.email && <div className="truncate max-w-[180px]">{agent.email}</div>}
                      {agent.phone && <div>{agent.phone}</div>}
                      {agent.ward && <div className="text-gray-500">Ward: {agent.ward}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditAgent(agent)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => {
                          setAgentToDelete(agent);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
    <div className="space-y-4 sm:space-y-8 bg-white px-2 sm:px-4">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-md border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Hierarchy Controls</h2>
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
              className="text-green-600 border-green-300 hover:bg-green-50 text-xs sm:text-sm"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedNodes({})}
              className="text-red-600 border-red-300 hover:bg-red-50 text-xs sm:text-sm"
            >
              Collapse All
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              disabled={zoomLevel <= 0.5}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
              disabled={zoomLevel >= 2}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
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
          
          <Link to="/add-agents" className="w-full sm:w-auto">
            <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add New Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Panchayath Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4 sm:p-8 rounded-xl shadow-xl text-center border">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 tracking-wide text-blue-400 break-words">{panchayathName.toUpperCase()}</h1>
        <div className="text-gray-300 text-sm sm:text-lg">Organization Hierarchy</div>
        <div className="mt-4 grid grid-cols-2 sm:flex sm:justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{agents.filter(a => a.role === 'coordinator').length}</div>
            <div className="text-gray-400">Coordinators</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-400">{agents.filter(a => a.role === 'supervisor').length}</div>
            <div className="text-gray-400">Supervisors</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-400">{agents.filter(a => a.role === 'group-leader').length}</div>
            <div className="text-gray-400">Group Leaders</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-400">{agents.filter(a => a.role === 'pro').length}</div>
            <div className="text-gray-400">P.R.Os</div>
          </div>
        </div>
        <div className="mt-2 text-xs sm:text-sm text-gray-400">
          Double-click on cards to expand/collapse • Click eye icon to view details • Use expand buttons
        </div>
      </div>

      {/* Tabs for Chart and Table View */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart" className="flex items-center gap-2 text-xs sm:text-sm">
            <Workflow className="h-3 w-3 sm:h-4 sm:w-4" />
            Chart View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2 text-xs sm:text-sm">
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
            Table View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="mt-6">
          <div className="bg-white p-2 sm:p-8 rounded-xl overflow-auto shadow-xl border">
            <div
              className="flex justify-center transition-transform duration-300 ease-in-out"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center top'
              }}
            >
              <div className="flex flex-col items-center gap-8 sm:gap-12">
                {coordinators.map(coordinator => (
                  <AgentCard key={coordinator.id} agent={coordinator} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="table" className="mt-6">
          <div className="bg-white p-3 sm:p-6 rounded-xl shadow-xl border">
            <TableView />
          </div>
        </TabsContent>
      </Tabs>

      {/* Agent Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
                <Badge className={`text-xs px-2 py-1 ${
                  selectedAgent.role === 'coordinator' ? 'bg-blue-100 text-blue-800' :
                  selectedAgent.role === 'supervisor' ? 'bg-gray-100 text-gray-800' :
                  selectedAgent.role === 'group-leader' ? 'bg-green-100 text-green-800' :
                  selectedAgent.role === 'pro' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getRoleLabel(selectedAgent.role)}
                </Badge>
              </div>
              
              {selectedAgent.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedAgent.email}</span>
                </div>
              )}
              
              {selectedAgent.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedAgent.phone}</span>
                </div>
              )}

              {selectedAgent.ward && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Ward: {selectedAgent.ward}</span>
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
        <DialogContent className="sm:max-w-[425px]">
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
