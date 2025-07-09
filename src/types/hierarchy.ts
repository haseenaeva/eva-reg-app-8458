
export type AgentRole = 'coordinator' | 'supervisor' | 'group-leader' | 'pro';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  panchayathId: string;
  superiorId?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Panchayath {
  id: string;
  name: string;
  district: string;
  state: string;
  createdAt: Date;
}

export interface TeamLeader {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  panchayathIds: string[];
  createdAt: Date;
}

export const ROLE_HIERARCHY = {
  'coordinator': { level: 1, label: 'Coordinator', reportsTo: 'Team Leader' },
  'supervisor': { level: 2, label: 'Supervisor', reportsTo: 'Coordinator' },
  'group-leader': { level: 3, label: 'Group Leader', reportsTo: 'Supervisor' },
  'pro': { level: 4, label: 'P.R.O', reportsTo: 'Group Leader' }
} as const;
