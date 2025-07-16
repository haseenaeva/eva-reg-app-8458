
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, ChevronDown, ChevronRight } from "lucide-react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { StarRating } from "./StarRating";

interface OrganizationChartViewProps {
  panchayathId: string;
  agents: Agent[];
  panchayathName: string;
}

interface CollapsedNodes {
  [key: string]: boolean;
}

export const OrganizationChartView = ({ 
  panchayathId, 
  agents, 
  panchayathName 
}: OrganizationChartViewProps) => {
  // Initialize collapsed state - by default show only coordinators and supervisors
  const [collapsedNodes, setCollapsedNodes] = useState<CollapsedNodes>(() => {
    const initialState: CollapsedNodes = {};
    agents.forEach(agent => {
      if (agent.role === 'supervisor') {
        initialState[agent.id] = true; // Collapse supervisors by default
      }
    });
    return initialState;
  });

  const toggleNode = (agentId: string) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  const getAgentsByRole = (role: Agent['role']) => {
    return agents.filter(agent => agent.role === role);
  };

  const getSubordinates = (agentId: string) => {
    return agents.filter(agent => agent.superior_id === agentId);
  };

  const coordinators = getAgentsByRole('coordinator');
  const supervisors = getAgentsByRole('supervisor');
  const groupLeaders = getAgentsByRole('group-leader');
  const pros = getAgentsByRole('pro');

  const getRoleColor = (role: Agent['role']) => {
    switch (role) {
      case 'coordinator':
        return 'bg-red-500 text-white';
      case 'supervisor':
        return 'bg-purple-500 text-white';
      case 'group-leader':
        return 'bg-orange-500 text-white';
      case 'pro':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const AgentNode = ({ agent }: { agent: Agent }) => {
    const subordinates = getSubordinates(agent.id);
    const hasSubordinates = subordinates.length > 0;
    const isCollapsed = collapsedNodes[agent.id];

    return (
      <div className="flex flex-col items-center mb-4">
        <Card className="w-48 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center justify-between w-full">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                {hasSubordinates && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(agent.id)}
                    className="p-1 h-6 w-6"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{agent.name}</h3>
                <Badge className={`text-xs mt-1 ${getRoleColor(agent.role)}`}>
                  {agent.role.charAt(0).toUpperCase() + agent.role.slice(1).replace('-', ' ')}
                </Badge>
              </div>
              {agent.ward && (
                <div className="text-xs text-gray-600">Ward: {agent.ward}</div>
              )}
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                {agent.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <StarRating
                  agentId={agent.id}
                  agentName={agent.name}
                  readOnly={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ConnectionLine = ({ vertical = false }) => (
    <div 
      className={`bg-gray-300 ${vertical ? 'h-8 w-0.5' : 'w-12 h-0.5'} mx-auto`}
    />
  );

  const renderHierarchyLevel = (parentAgents: Agent[], childRole: Agent['role']) => {
    return parentAgents.map((parent) => {
      const children = agents.filter(agent => 
        agent.superior_id === parent.id && agent.role === childRole
      );
      const isCollapsed = collapsedNodes[parent.id];

      if (children.length === 0) return null;

      return (
        <div key={parent.id} className="flex flex-col items-center">
          {!isCollapsed && (
            <>
              <ConnectionLine vertical />
              <div className="flex justify-center gap-8">
                {children.map((child) => (
                  <div key={child.id} className="flex flex-col items-center">
                    <AgentNode agent={child} />
                    {childRole === 'supervisor' && renderHierarchyLevel([child], 'group-leader')}
                    {childRole === 'group-leader' && renderHierarchyLevel([child], 'pro')}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    });
  };

  if (agents.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600">No agents have been added to {panchayathName} yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max p-8">
        {coordinators.map((coordinator) => (
          <div key={coordinator.id} className="flex flex-col items-center">
            <AgentNode agent={coordinator} />
            {renderHierarchyLevel([coordinator], 'supervisor')}
          </div>
        ))}
      </div>
    </div>
  );
};
