import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Demo user data
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@keepmeontrack.co',
  user_metadata: {
    full_name: 'Demo User'
  }
} as User;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode is enabled in localStorage
    const demoMode = localStorage.getItem('demo_mode') === 'true';
    if (demoMode) {
      setIsDemoMode(true);
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    // Clear demo mode first
    if (isDemoMode) {
      localStorage.removeItem('demo_mode');
      setIsDemoMode(false);
      setUser(null);
      return { error: null };
    }

    // Regular sign out
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const enterDemoMode = () => {
    localStorage.setItem('demo_mode', 'true');
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setLoading(false);
  };

  return {
    user,
    loading,
    isDemoMode,
    signUp,
    signIn,
    signOut,
    enterDemoMode,
  };
}