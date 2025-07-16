
import { useState } from "react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, User, Phone, Users, Building2 } from "lucide-react";
import { StarRating } from "./StarRating";

interface OrganizationChartProps {
  panchayathId: string;
  agents: Agent[];
  panchayathName: string;
}

interface ExpandedNodes {
  [key: string]: boolean;
}

export const EnhancedOrganizationChart = ({ panchayathId, agents, panchayathName }: OrganizationChartProps) => {
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const coordinators = agents.filter(agent => agent.role === 'coordinator');
  const supervisors = agents.filter(agent => agent.role === 'supervisor');
  const groupLeaders = agents.filter(agent => agent.role === 'group-leader');
  const pros = agents.filter(agent => agent.role === 'pro');

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600">No agents have been added to this panchayath yet.</p>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator': return 'from-purple-500 to-purple-600';
      case 'supervisor': return 'from-blue-500 to-blue-600';
      case 'group-leader': return 'from-green-500 to-green-600';
      case 'pro': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'coordinator': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'supervisor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'group-leader': return 'bg-green-100 text-green-800 border-green-200';
      case 'pro': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const AgentNode = ({ agent, level = 0 }: { agent: Agent; level?: number }) => {
    const subordinates = getSubordinates(agent.id);
    const hasSubordinates = subordinates.length > 0;
    const isExpanded = expandedNodes[agent.id] ?? true;
    const marginLeft = level * 2;

    return (
      <div className={`ml-${marginLeft}`}>
        <Card className={`mb-4 border-l-4 border-l-${getRoleColor(agent.role).split('-')[1]}-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${getRoleColor(agent.role)} bg-opacity-5`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasSubordinates && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(agent.id)}
                    className="p-1 h-6 w-6"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <div className={`p-2 rounded-full bg-gradient-to-r ${getRoleColor(agent.role)}`}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {agent.name}
                  </CardTitle>
                  <Badge className={`${getRoleBadgeColor(agent.role)} text-xs font-medium`}>
                    {getRoleLabel(agent.role)}
                  </Badge>
                </div>
              </div>
              {hasSubordinates && (
                <Badge variant="outline" className="bg-gray-50">
                  {subordinates.length} subordinate{subordinates.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 text-sm text-gray-600 mb-3">
              {agent.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{agent.phone}</span>
                </div>
              )}
            </div>
            <div className="mb-3">
              <StarRating
                agentId={agent.id}
                agentName={agent.name}
                readOnly={false}
              />
            </div>
            
            {hasSubordinates && isExpanded && (
              <div className="mt-4 space-y-2 border-l-2 border-gray-200 pl-4">
                {subordinates.map((subordinate) => (
                  <AgentNode 
                    key={subordinate.id} 
                    agent={subordinate} 
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Panchayath Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">{panchayathName}</h2>
            <p className="text-indigo-100">Organization Structure</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{coordinators.length}</div>
          <div className="text-sm text-purple-700">Coordinators</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{supervisors.length}</div>
          <div className="text-sm text-blue-700">Supervisors</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{groupLeaders.length}</div>
          <div className="text-sm text-green-700">Group Leaders</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{pros.length}</div>
          <div className="text-sm text-orange-700">P.R.Os</div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Hierarchy Structure</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allIds = agents.map(a => a.id);
                const allExpanded = allIds.reduce((acc, id) => ({ ...acc, [id]: true }), {});
                setExpandedNodes(allExpanded);
              }}
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedNodes({})}
            >
              Collapse All
            </Button>
          </div>
        </div>

        {coordinators.map((coordinator) => (
          <AgentNode key={coordinator.id} agent={coordinator} />
        ))}
      </div>

      {/* Unassigned Agents */}
      {agents.some(agent => !agent.superior_id && agent.role !== 'coordinator') && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Unassigned Agents</h3>
          <div className="space-y-2">
            {agents
              .filter(agent => !agent.superior_id && agent.role !== 'coordinator')
              .map((agent) => (
                <AgentNode key={agent.id} agent={agent} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
