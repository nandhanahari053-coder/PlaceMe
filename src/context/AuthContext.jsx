import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // maybeSingle returns null (not an error) when 0 rows found
        
      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  const refreshUnread = useCallback(async (userId) => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (!error && count !== null) {
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        let userProfile = await fetchProfile(session.user.id);
        
        // If profile doesn't exist in DB yet, try to create one from metadata
        if (!userProfile) {
          const fallbackProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            profile_completion: 20
          };
          const { data: created } = await supabase.from('profiles').upsert(fallbackProfile).select().maybeSingle();
          userProfile = created || fallbackProfile;
        }

        const effectiveRole = userProfile?.role || session.user.user_metadata?.role || 'student';
        setUser({ ...session.user, role: effectiveRole, name: userProfile?.name || session.user.user_metadata?.name || '' });
        setProfile(userProfile);
        refreshUnread(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for changes on auth state (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        let userProfile = await fetchProfile(session.user.id);
        if (!userProfile) {
          const fallbackProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            profile_completion: 20
          };
          const { data: created } = await supabase.from('profiles').upsert(fallbackProfile).select().maybeSingle();
          userProfile = created || fallbackProfile;
        }

        const effectiveRole = userProfile?.role || session.user.user_metadata?.role || 'student';
        setUser({ ...session.user, role: effectiveRole, name: userProfile?.name || session.user.user_metadata?.name || '' });
        setProfile(userProfile);
        refreshUnread(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setUnreadCount(0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, refreshUnread]);

  const register = async (formData) => {
    const { email, password, name, role, college, branch, company_name } = formData;
    
    // Sign up — pass name, role, college, branch, company_name as metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name, 
          role: role || 'student',
          college: college || '',
          branch: branch || '',
          company_name: company_name || ''
        },
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    // When email confirmation is enabled, authData.user exists but
    // authData.session is null — the user must verify their email first.
    if (authData.user && !authData.session) {
      return {
        data: { user: authData.user },
        confirmationPending: true,
      };
    }

    // Email confirmation is disabled — session is live immediately.
    if (authData.user) {
      let userProfile = await fetchProfile(authData.user.id);
      if (!userProfile) {
        const newProfile = {
          id: authData.user.id,
          name,
          email,
          role: role || 'student',
          college: college || null,
          branch: branch || null,
          company_name: company_name || null,
          profile_completion: 30
        };
        const { data: created } = await supabase.from('profiles').upsert(newProfile).select().maybeSingle();
        userProfile = created || newProfile;
      }
      setProfile(userProfile);
      setUser({ ...authData.user, role: userProfile?.role || role || 'student', name: userProfile?.name || name });
      return { data: { user: authData.user, profile: userProfile } };
    }
    
    return { error: 'Registration failed for an unknown reason.' };
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Profile state is handled by the onAuthStateChange listener
    return { data };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error.message);
    }
  };

  const updateProfile = async (updatedData) => {
    if (!user) return { error: 'No authenticated user.' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.id)
      .select()
      .maybeSingle(); // maybeSingle returns null (not an error) when 0 rows matched

    if (error) {
      console.error('Error updating profile:', error);
      return { error: error.message };
    }

    setProfile(data);
    return { data };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      unreadCount, 
      register, 
      login, 
      logout, 
      updateProfile, 
      refreshUnread 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
