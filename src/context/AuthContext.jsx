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
        .single();
        
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
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
        refreshUnread(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for changes on auth state (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
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
    const { email, password, name, role } = formData;
    
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { error: authError.message };
    }

    if (authData.user) {
      // 2. Create the user profile in our custom 'profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            name, 
            email, 
            role: role || 'student' 
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { error: profileError.message };
      }

      setProfile(profileData);
      return { data: { user: authData.user, profile: profileData } };
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
      .single();

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
