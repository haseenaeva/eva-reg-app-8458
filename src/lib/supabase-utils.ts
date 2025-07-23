import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tlosromklbciqlhruebz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsb3Nyb21rbGJjaXFsaHJ1ZWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjYzNTIsImV4cCI6MjA2ODg0MjM1Mn0.cBeyN29cZXX-7zAy6l8NQLbCyo_Zz79ebrJ8dS2Mac8";

// Create a typed supabase client to work around empty types file
export const typedSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

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