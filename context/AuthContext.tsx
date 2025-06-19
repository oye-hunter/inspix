import { AuthError, Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type UserInfo = {
  id: number;
  user_id: string;
  user_name: string | null;
  name: string | null;
  bio: string | null;
  created_at: string;
};

type AuthContextProps = {
  session: Session | null;
  isLoading: boolean;
  userInfo: UserInfo | null;
  profileComplete: boolean;
  checkProfileComplete: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: { session: Session | null; user: any | null };
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: { session: Session | null; user: any | null };
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  // Fetch user profile information
  const fetchUserInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user info:', error);
        return null;
      }

      setUserInfo(data);
      setProfileComplete(!!data);
      return data;
    } catch (error) {
      console.error('Error in fetchUserInfo:', error);
      return null;
    }
  };

  const checkProfileComplete = async () => {
    if (!session?.user?.id) return false;
    
    const userInfoData = await fetchUserInfo(session.user.id);
    const isComplete = !!userInfoData;
    setProfileComplete(isComplete);
    return isComplete;
  };

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user?.id) {
        await fetchUserInfo(session.user.id);
      }
      
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user?.id) {
        await fetchUserInfo(session.user.id);
      } else {
        setUserInfo(null);
        setProfileComplete(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signInWithPassword({ email, password });
    
    if (response.data.session?.user?.id) {
      await fetchUserInfo(response.data.session.user.id);
    }
    
    setIsLoading(false);
    return response;
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await supabase.auth.signUp({ email, password });
    setIsLoading(false);
    return response;
  };

  const signOut = async () => {
    setIsLoading(true);
    const response = await supabase.auth.signOut();
    setUserInfo(null);
    setProfileComplete(false);
    setIsLoading(false);
    return response;
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      isLoading, 
      userInfo, 
      profileComplete,
      checkProfileComplete,
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
