
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone } from "lucide-react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { StarRating } from "./StarRating";

interface AgentRatingsProps {
  agents: Agent[];
  panchayathName: string;
}

export const AgentRatings = ({ agents, panchayathName }: AgentRatingsProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRatingChange = (agentId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [agentId]: rating
    }));
  };

  const getRoleColor = (role: Agent['role']) => {
    switch (role) {
      case 'coordinator':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'group-leader':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pro':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const sortedAgents = [...agents].sort((a, b) => {
    const roleOrder = { 'coordinator': 1, 'supervisor': 2, 'group-leader': 3, 'pro': 4 };
    return (roleOrder[a.role] || 5) - (roleOrder[b.role] || 5);
  });

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">No agents found for {panchayathName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance Ratings - {panchayathName}</CardTitle>
        <p className="text-sm text-gray-600">Rate agents to track their working progress</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAgents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-gray-200">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <Badge className={getRoleColor(agent.role)}>
                      {getRoleLabel(agent.role)}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    {agent.ward && (
                      <span>Ward: {agent.ward}</span>
                    )}
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
              </div>
              <div className="flex items-center gap-4">
                <StarRating
                  agentId={agent.id}
                  agentName={agent.name}
                  initialRating={ratings[agent.id] || 0}
                  onRatingChange={(rating) => handleRatingChange(agent.id, rating)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
