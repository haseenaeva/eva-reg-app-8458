import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Search, User, Phone, FileText, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DailyActivity {
  id: string;
  agent_id: string;
  mobile_number: string;
  activity_date: string;
  activity_description: string;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  phone: string;
  role: string;
  panchayath_id: string;
}

interface DailyActivityHistoryProps {
  panchayathId: string;
}

export const DailyActivityHistory = ({ panchayathId }: DailyActivityHistoryProps) => {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchActivitiesAndAgents();
  }, [panchayathId]);

  const fetchActivitiesAndAgents = async () => {
    try {
      setIsLoading(true);
      
      // Fetch agents for this panchayath
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('panchayath_id', panchayathId);

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);

      // Get agent IDs for this panchayath
      const agentIds = agentsData?.map(agent => agent.id) || [];
      
      if (agentIds.length === 0) {
        setActivities([]);
        return;
      }

      // Fetch activities for these agents
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('daily_activities')
        .select('*')
        .in('agent_id', agentIds)
        .order('activity_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activity history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentByPhone = (phone: string) => {
    return agents.find(agent => agent.phone === phone);
  };

  const getAgentById = (agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  };

  const filteredActivities = activities.filter(activity => {
    const agent = getAgentById(activity.agent_id);
    return (
      agent?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.mobile_number.includes(searchQuery) ||
      activity.activity_description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coordinator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'group-leader':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pro':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Daily Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading activities...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Daily Activity History
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by agent name, mobile, or activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-600">
              {activities.length === 0 
                ? "No daily activities have been logged for this panchayath yet."
                : "No activities match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredActivities.map((activity) => {
              const agent = getAgentById(activity.agent_id);
              return (
                <div key={activity.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {agent?.name || 'Unknown Agent'}
                      </span>
                      {agent && (
                        <Badge className={`text-xs px-2 py-1 ${getRoleColor(agent.role)}`}>
                          {agent.role.charAt(0).toUpperCase() + agent.role.slice(1).replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {activity.mobile_number}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(activity.activity_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 p-3 bg-white rounded border">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {activity.activity_description}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Logged on {format(new Date(activity.created_at), 'MMM dd, yyyy at HH:mm')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};