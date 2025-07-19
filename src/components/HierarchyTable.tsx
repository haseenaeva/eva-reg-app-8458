
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { DailyActivityHistory } from "./DailyActivityHistory";

interface HierarchyTableProps {
  agents: Agent[];
  panchayathName: string;
}

export const HierarchyTable = ({ agents, panchayathName }: HierarchyTableProps) => {
  const getRoleColor = (role: Agent['role']) => {
    switch (role) {
      case 'coordinator':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-teal-100 text-teal-800';
      case 'group-leader':
        return 'bg-orange-100 text-orange-800';
      case 'pro':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuperiorName = (superiorId: string | null) => {
    if (!superiorId) return '-';
    const superior = agents.find(agent => agent.id === superiorId);
    return superior ? superior.name : '-';
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
        <CardTitle>Hierarchy Table - {panchayathName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Superior</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(agent.role)}>
                      {agent.role.charAt(0).toUpperCase() + agent.role.slice(1).replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{getSuperiorName(agent.superior_id)}</TableCell>
                  <TableCell>{agent.ward || '-'}</TableCell>
                  <TableCell>{agent.phone || '-'}</TableCell>
                  <TableCell>
                    <DailyActivityHistory 
                      agentId={agent.id} 
                      agentName={agent.name} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
