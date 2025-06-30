import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for guest mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestToken = urlParams.get('guest');
    
    if (guestToken) {
      // Create a mock guest user
      const guestUser = {
        id: `guest_${guestToken}`,
        email: `guest_${guestToken}@demo.com`,
        user_metadata: {
          full_name: 'Demo User'
        }
      } as User;
      
      setUser(guestUser);
      setIsGuest(true);
      setLoading(false);
      
      // Store guest session in sessionStorage instead of localStorage
      // This makes it tab-specific rather than browser-wide
      sessionStorage.setItem('guest_session', JSON.stringify({
        user: guestUser,
        token: guestToken,
        timestamp: Date.now()
      }));
      
      return;
    }

    // Check for existing guest session in sessionStorage (not localStorage)
    const guestSession = sessionStorage.getItem('guest_session');
    if (guestSession) {
      try {
        const session = JSON.parse(guestSession);
        // Guest sessions expire after 24 hours
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          setUser(session.user);
          setIsGuest(true);
          setLoading(false);
          return;
        } else {
          sessionStorage.removeItem('guest_session');
        }
      } catch (error) {
        sessionStorage.removeItem('guest_session');
      }
    }

    // Clean up any old localStorage guest sessions
    localStorage.removeItem('guest_session');

    // Get initial session for regular users
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsGuest(false);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsGuest(false);
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
    if (isGuest) {
      sessionStorage.removeItem('guest_session');
      setUser(null);
      setIsGuest(false);
      // Redirect to main page without guest parameter
      window.location.href = window.location.origin;
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const createGuestSession = () => {
    const guestToken = Math.random().toString(36).substring(2, 15);
    const guestUrl = `${window.location.origin}?guest=${guestToken}`;
    return guestUrl;
  };

  return {
    user,
    isGuest,
    loading,
    signUp,
    signIn,
    signOut,
    createGuestSession,
  };
}