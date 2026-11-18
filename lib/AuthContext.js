'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthChange,
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  getUserProfile,
} from './auth';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const prof = await getUserProfile(firebaseUser.uid);
          setProfile(prof || {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Writer',
            email: firebaseUser.email,
          });
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Writer',
            email: firebaseUser.email,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const user = await authLogin(email, password);
    return user;
  };

  const signup = async (name, email, password) => {
    const user = await authSignup(name, email, password);
    return user;
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

