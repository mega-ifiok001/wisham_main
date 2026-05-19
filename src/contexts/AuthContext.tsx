import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isAdmin?: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or create user profile
  const fetchProfile = async (currentUser: User) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const isEligibleAdmin = currentUser.email?.startsWith('admin@') || currentUser.email === 'ifiokaniebiet@gmail.com' || false;

      if (error || !data) {
        // Profile doesn't exist (e.g. created via Supabase Auth dashboard) -> auto create
        const { data: newProf, error: insertErr } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || 'Admin User',
            is_admin: isEligibleAdmin,
          })
          .select()
          .single();

        if (!insertErr && newProf) {
          data = newProf;
        }
      } else if (isEligibleAdmin && !data.is_admin) {
        // Auto-upgrade existing profile to admin if email matches
        const { data: updatedProf } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', currentUser.id)
          .select()
          .single();

        if (updatedProf) {
          data = updatedProf;
        }
      }

      setProfile(data || null);
      return data;
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign in
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error, isAdmin: false };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const prof = await fetchProfile(data.user);
        const userIsAdmin = prof?.is_admin || data.user.email?.startsWith('admin@') || data.user.email === 'ifiokaniebiet@gmail.com' || false;
        setIsLoading(false);
        return { error: null, isAdmin: userIsAdmin };
      }

      setIsLoading(false);
      return { error: null, isAdmin: false };
    } catch (error) {
      setIsLoading(false);
      return { error: error as Error, isAdmin: false };
    }
  };

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (!error && data.user) {
        const isEligibleAdmin = email.startsWith('admin@') || email === 'ifiokaniebiet@gmail.com';
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          is_admin: isEligibleAdmin,
        });
      }

      setIsLoading(false);
      return { error };
    } catch (error) {
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsLoading(false);
  };

  const isUserAdmin = profile?.is_admin || user?.email?.startsWith('admin@') || user?.email === 'ifiokaniebiet@gmail.com' || false;

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAdmin: isUserAdmin,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
