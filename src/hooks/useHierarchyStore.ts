
import { useState, useEffect } from 'react';
import { Agent, Panchayath, TeamLeader } from '@/types/hierarchy';

interface HierarchyStore {
  panchayaths: Panchayath[];
  agents: Agent[];
  teamLeaders: TeamLeader[];
}

const STORAGE_KEY = 'hierarchy-data';

const defaultData: HierarchyStore = {
  panchayaths: [],
  agents: [],
  teamLeaders: []
};

export const useHierarchyStore = () => {
  const [data, setData] = useState<HierarchyStore>(defaultData);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, []);

  const saveData = (newData: HierarchyStore) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const addPanchayath = (panchayath: Omit<Panchayath, 'id' | 'createdAt'>) => {
    const newPanchayath: Panchayath = {
      ...panchayath,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    saveData({
      ...data,
      panchayaths: [...data.panchayaths, newPanchayath]
    });
  };

  const addAgent = (agent: Omit<Agent, 'id' | 'createdAt'>) => {
    const newAgent: Agent = {
      ...agent,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    saveData({
      ...data,
      agents: [...data.agents, newAgent]
    });
  };

  const addTeamLeader = (teamLeader: Omit<TeamLeader, 'id' | 'createdAt'>) => {
    const newTeamLeader: TeamLeader = {
      ...teamLeader,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    saveData({
      ...data,
      teamLeaders: [...data.teamLeaders, newTeamLeader]
    });
  };

  const getAgentsByPanchayath = (panchayathId: string) => {
    return data.agents.filter(agent => agent.panchayathId === panchayathId);
  };

  const getAgentsByRole = (panchayathId: string, role: Agent['role']) => {
    return data.agents.filter(agent => 
      agent.panchayathId === panchayathId && agent.role === role
    );
  };

  const getSuperiorOptions = (panchayathId: string, role: Agent['role']) => {
    const roleHierarchy = {
      'supervisor': 'coordinator',
      'group-leader': 'supervisor',
      'pro': 'group-leader'
    };
    
    const superiorRole = roleHierarchy[role as keyof typeof roleHierarchy];
    if (!superiorRole) return [];
    
    return data.agents.filter(agent => 
      agent.panchayathId === panchayathId && agent.role === superiorRole
    );
  };

  return {
    data,
    addPanchayath,
    addAgent,
    addTeamLeader,
    getAgentsByPanchayath,
    getAgentsByRole,
    getSuperiorOptions
  };
};
