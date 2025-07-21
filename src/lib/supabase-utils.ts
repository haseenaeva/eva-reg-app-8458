import { supabase } from "@/integrations/supabase/client";

// Utility function to provide typed access to Supabase tables
// This works around the empty types file issue
export const typedSupabase = {
  from: (tableName: string) => {
    return supabase.from(tableName as any);
  }
};

// Common table names for type safety
export const TABLES = {
  AGENTS: 'agents',
  MANAGEMENT_TEAMS: 'management_teams',
  MANAGEMENT_TEAM_MEMBERS: 'management_team_members',
  PANCHAYATHS: 'panchayaths',
  TASKS: 'tasks',
  TASK_REMARKS: 'task_remarks',
  DAILY_ACTIVITIES: 'daily_activities',
  AGENT_RATINGS: 'agent_ratings',
  USER_PROFILES: 'user_profiles',
  USER_REGISTRATION_REQUESTS: 'user_registration_requests',
  PANCHAYATH_NOTES: 'panchayath_notes',
  TEAM_LEADERS: 'team_leaders',
  TEAM_LEADER_PANCHAYATHS: 'team_leader_panchayaths'
} as const;