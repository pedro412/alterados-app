import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, chapter:chapters(*)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data as Profile);
    }
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function register(email: string, password: string, fullName: string, chapterId: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, chapter_id: chapterId },
      },
    });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  async function refreshProfile() {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  }

  const isAdmin = profile?.is_admin === true;
  const isPresident = profile?.role === 'president' && profile?.is_verified === true;

  return {
    session,
    profile,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isAdmin,
    isPresident,
    isAuthenticated: !!session,
  };
}
