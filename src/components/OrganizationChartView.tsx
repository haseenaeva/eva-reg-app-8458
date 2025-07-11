
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone } from "lucide-react";
import { Agent } from "@/hooks/useSupabaseHierarchy";

interface OrganizationChartViewProps {
  panchayathId: string;
  agents: Agent[];
  panchayathName: string;
}

export const OrganizationChartView = ({ 
  panchayathId, 
  agents, 
  panchayathName 
}: OrganizationChartViewProps) => {
  const getAgentsByRole = (role: Agent['role']) => {
    return agents.filter(agent => agent.role === role);
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
        return 'bg-teal-500 text-white';
      case 'group-leader':
        return 'bg-orange-500 text-white';
      case 'pro':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const AgentNode = ({ agent }: { agent: Agent }) => (
    <div className="flex flex-col items-center mb-4">
      <Card className="w-48 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600" />
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
              {agent.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-32">{agent.email}</span>
                </div>
              )}
              {agent.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{agent.phone}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ConnectionLine = ({ vertical = false, length = 50 }) => (
    <div 
      className={`bg-gray-300 ${vertical ? 'h-8 w-0.5' : 'w-12 h-0.5'} mx-auto`}
    />
  );

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
        {/* Coordinators Level */}
        {coordinators.map((coordinator, coordIndex) => (
          <div key={coordinator.id} className="flex flex-col items-center">
            <AgentNode agent={coordinator} />
            
            {/* Connection line down */}
            {supervisors.filter(s => s.superior_id === coordinator.id).length > 0 && (
              <ConnectionLine vertical />
            )}
            
            {/* Supervisors Level */}
            <div className="flex justify-center gap-16 mb-4">
              {supervisors
                .filter(s => s.superior_id === coordinator.id)
                .map((supervisor, supIndex) => (
                  <div key={supervisor.id} className="flex flex-col items-center">
                    <AgentNode agent={supervisor} />
                    
                    {/* Connection line down */}
                    {groupLeaders.filter(gl => gl.superior_id === supervisor.id).length > 0 && (
                      <ConnectionLine vertical />
                    )}
                    
                    {/* Group Leaders Level */}
                    <div className="flex justify-center gap-8">
                      {groupLeaders
                        .filter(gl => gl.superior_id === supervisor.id)
                        .map((groupLeader, glIndex) => (
                          <div key={groupLeader.id} className="flex flex-col items-center">
                            <AgentNode agent={groupLeader} />
                            
                            {/* Connection line down */}
                            {pros.filter(pro => pro.superior_id === groupLeader.id).length > 0 && (
                              <ConnectionLine vertical />
                            )}
                            
                            {/* PROs Level */}
                            <div className="flex justify-center gap-4">
                              {pros
                                .filter(pro => pro.superior_id === groupLeader.id)
                                .map((pro) => (
                                  <AgentNode key={pro.id} agent={pro} />
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Horizontal connection lines for multiple supervisors */}
            {supervisors.filter(s => s.superior_id === coordinator.id).length > 1 && (
              <div className="flex items-center justify-center -mt-20 mb-4">
                <div className="w-64 h-0.5 bg-gray-300"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
