import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { seedDatabase, mockAuth, mockNotifications } from '../lib/mockDb';

// Seed DB once
seedDatabase();

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback((uid) => {
    if (uid) setUnreadCount(mockNotifications.unreadCount(uid));
  }, []);

  useEffect(() => {
    // Restore session from localStorage
    const session = mockAuth.getSession();
    if (session) {
      setUser(session.user);
      setProfile(session.profile);
      refreshUnread(session.user.id);
    }
    setLoading(false);
  }, [refreshUnread]);

  const register = async (formData) => {
    const result = mockAuth.signUp(formData);
    if (result.error) return result;
    setUser(result.data.user);
    setProfile(result.data.profile);
    refreshUnread(result.data.user.id);
    return result;
  };

  const login = async ({ email, password }) => {
    const result = mockAuth.signIn({ email, password });
    if (result.error) return result;
    setUser(result.data.user);
    setProfile(result.data.profile);
    refreshUnread(result.data.user.id);
    return result;
  };

  const logout = () => {
    mockAuth.signOut();
    setUser(null);
    setProfile(null);
    setUnreadCount(0);
  };

  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    refreshUnread(updatedProfile?.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, unreadCount, register, login, logout, updateProfile, refreshUnread }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
