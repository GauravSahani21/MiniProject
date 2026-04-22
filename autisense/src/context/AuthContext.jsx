import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/* ── Demo accounts (no real backend) ──────────────── */
const DEMO_ACCOUNTS = {
  parent: { name: 'Priya Sharma',     email: 'parent@demo.com', role: 'parent' },
  doctor: { name: 'Dr. Ramesh Gupta', email: 'doctor@demo.com', role: 'doctor' },
  admin:  { name: 'Admin User',       email: 'admin@demo.com',  role: 'admin'  },
};

/* ── Provider ─────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('autisense_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email, password, role) => {
    // Accept any non-empty email+password — map role to demo account
    if (!email || !password || !role) {
      return { ok: false, error: 'All fields are required.' };
    }
    const base = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.parent;
    // Use the entered email + the demo name/role
    const userData = { ...base, email, role };
    setUser(userData);
    localStorage.setItem('autisense_user', JSON.stringify(userData));
    return { ok: true, user: userData };
  }, []);

  const register = useCallback((name, email, password, confirmPassword, role) => {
    if (!name || !email || !password || !confirmPassword || !role) {
      return { ok: false, error: 'All fields are required.' };
    }
    if (password !== confirmPassword) {
      return { ok: false, error: 'Passwords do not match.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }
    const userData = { name, email, role };
    setUser(userData);
    localStorage.setItem('autisense_user', JSON.stringify(userData));
    return { ok: true, user: userData };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('autisense_user');
  }, []);

  const isAuthenticated = !!user;

  const dashboardPath = useCallback((u = user) => {
    if (!u) return '/login';
    if (u.role === 'doctor') return '/doctor';
    if (u.role === 'admin')  return '/admin';
    return '/parent';
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated,
      dashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────── */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
