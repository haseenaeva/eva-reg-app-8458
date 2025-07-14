import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Agent {
  id: string;
  name: string;
  role: 'coordinator' | 'supervisor' | 'group-leader' | 'pro';
  panchayath_id: string;
  superior_id?: string;
  phone?: string;
  ward?: string;
  created_at: string;
  updated_at: string;
}

export interface Panchayath {
  id: string;
  name: string;
  district: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface TeamLeader {
  id: string;
  name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseHierarchy = () => {
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [panchayathsRes, agentsRes, teamLeadersRes] = await Promise.all([
        supabase.from('panchayaths').select('*').order('name'),
        supabase.from('agents').select('*').order('name'),
        supabase.from('team_leaders').select('*').order('name')
      ]);

      if (panchayathsRes.error) throw panchayathsRes.error;
      if (agentsRes.error) throw agentsRes.error;
      if (teamLeadersRes.error) throw teamLeadersRes.error;

      setPanchayaths(panchayathsRes.data || []);
      setAgents(agentsRes.data || []);
      setTeamLeaders(teamLeadersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data from database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addPanchayath = async (panchayath: Omit<Panchayath, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('panchayaths')
        .insert([panchayath])
        .select()
        .single();

      if (error) throw error;

      setPanchayaths(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Panchayath added successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding panchayath:', error);
      toast({
        title: "Error",
        description: "Failed to add panchayath",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addAgent = async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select()
        .single();

      if (error) throw error;

      setAgents(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Agent added successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        title: "Error",
        description: "Failed to add agent",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAgentsByPanchayath = (panchayathId: string) => {
    return agents.filter(agent => agent.panchayath_id === panchayathId);
  };

  const getAgentsByRole = (panchayathId: string, role: Agent['role']) => {
    return agents.filter(agent => 
      agent.panchayath_id === panchayathId && agent.role === role
    );
  };

  const getSuperiorOptions = (panchayathId: string, role: Agent['role']) => {
    const roleHierarchy = {
      'supervisor': 'coordinator',
      'group-leader': 'supervisor',
      'pro': 'group-leader'
    } as const;
    
    const superiorRole = roleHierarchy[role as keyof typeof roleHierarchy];
    if (!superiorRole) return [];
    
    return agents.filter(agent => 
      agent.panchayath_id === panchayathId && agent.role === superiorRole
    );
  };

  return {
    panchayaths,
    agents,
    teamLeaders,
    isLoading,
    addPanchayath,
    addAgent,
    getAgentsByPanchayath,
    getAgentsByRole,
    getSuperiorOptions,
    refetch: fetchData
  };
};
