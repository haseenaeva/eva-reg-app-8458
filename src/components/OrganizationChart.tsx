
import { useHierarchyStore } from "@/hooks/useHierarchyStore";
import { ROLE_HIERARCHY } from "@/types/hierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Users } from "lucide-react";

interface OrganizationChartProps {
  panchayathId: string;
}

export const OrganizationChart = ({ panchayathId }: OrganizationChartProps) => {
  const { getAgentsByPanchayath, getAgentsByRole } = useHierarchyStore();
  
  const allAgents = getAgentsByPanchayath(panchayathId);
  const coordinators = getAgentsByRole(panchayathId, 'coordinator');
  const supervisors = getAgentsByRole(panchayathId, 'supervisor');
  const groupLeaders = getAgentsByRole(panchayathId, 'group-leader');
  const pros = getAgentsByRole(panchayathId, 'pro');

  if (allAgents.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600">No agents have been added to this panchayath yet.</p>
      </div>
    );
  }

  const AgentCard = ({ agent, children }: { agent: any; children?: React.ReactNode }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <CardTitle className="text-base">{agent.name}</CardTitle>
          </div>
          <Badge variant="secondary">
            {ROLE_HIERARCHY[agent.role]?.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-4 text-sm text-gray-600 mb-3">
          {agent.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {agent.phone}
            </div>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{coordinators.length}</div>
          <div className="text-sm text-gray-600">Coordinators</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{supervisors.length}</div>
          <div className="text-sm text-gray-600">Supervisors</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{groupLeaders.length}</div>
          <div className="text-sm text-gray-600">Group Leaders</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{pros.length}</div>
          <div className="text-sm text-gray-600">P.R.Os</div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-6">
        {coordinators.map((coordinator) => (
          <AgentCard key={coordinator.id} agent={coordinator}>
            <div className="ml-6 space-y-4">
              {supervisors
                .filter(s => s.superiorId === coordinator.id)
                .map((supervisor) => (
                  <AgentCard key={supervisor.id} agent={supervisor}>
                    <div className="ml-6 space-y-4">
                      {groupLeaders
                        .filter(gl => gl.superiorId === supervisor.id)
                        .map((groupLeader) => (
                          <AgentCard key={groupLeader.id} agent={groupLeader}>
                            <div className="ml-6 space-y-2">
                              {pros
                                .filter(pro => pro.superiorId === groupLeader.id)
                                .map((pro) => (
                                  <AgentCard key={pro.id} agent={pro} />
                                ))}
                            </div>
                          </AgentCard>
                        ))}
                    </div>
                  </AgentCard>
                ))}
            </div>
          </AgentCard>
        ))}
      </div>

      {/* Unassigned Agents */}
      {allAgents.some(agent => !agent.superiorId && agent.role !== 'coordinator') && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Unassigned Agents</h3>
          <div className="space-y-2">
            {allAgents
              .filter(agent => !agent.superiorId && agent.role !== 'coordinator')
              .map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
