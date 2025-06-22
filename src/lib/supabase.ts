import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_date: string | null;
          status: 'active' | 'completed' | 'paused';
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'paused';
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'paused';
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          title: string;
          description: string | null;
          frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
          frequency_value: number;
          due_date: string | null;
          is_completed: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
          frequency_value?: number;
          due_date?: string | null;
          is_completed?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
          frequency_value?: number;
          due_date?: string | null;
          is_completed?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_at?: string;
          created_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_date: string | null;
          is_completed: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_date?: string | null;
          is_completed?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_date?: string | null;
          is_completed?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};