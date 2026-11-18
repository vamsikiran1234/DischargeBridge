import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  logout: () => void;
}

const PRESET_ACCOUNTS: Record<Role, { email: string; pass: string; title: string }> = {
  DOCTOR: { email: 'doctor@dischargebridge.com', pass: 'password123', title: 'Dr. Sarah Mitchell, MD (Attending Physician)' },
  NURSE: { email: 'nurse@dischargebridge.com', pass: 'password123', title: 'Elena Rostova, RN (Lead Ward Nurse)' },
  PHARMACIST: { email: 'pharmacist@dischargebridge.com', pass: 'password123', title: 'Marcus Vance, RPh (Clinical Pharmacist)' },
  BILLING_STAFF: { email: 'billing@dischargebridge.com', pass: 'password123', title: 'Rachel Adams (TPA & Billing Clearance)' },
  COORDINATOR: { email: 'coordinator@dischargebridge.com', pass: 'password123', title: 'David Miller (Discharge Care Coordinator)' },
  ADMIN: { email: 'admin@dischargebridge.com', pass: 'password123', title: 'Dr. Arthur Sterling (Hospital Administrator)' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dischargebridge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('dischargebridge_token');
      if (savedToken) {
        try {
          const profile = await api.getCurrentUser();
          setUser({
            id: profile.userId,
            fullName: profile.fullName,
            email: profile.email,
            role: profile.role as Role,
            department: profile.departmentId ? { id: profile.departmentId, name: profile.departmentName || '', code: '', active: true } : undefined,
            active: true,
          });
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      } else {
        // Auto-login as coordinator for instant first load experience
        try {
          await switchRole('COORDINATOR');
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('dischargebridge_token', res.token);
      setToken(res.token);
      setUser({
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        role: res.role as Role,
        department: res.departmentId ? { id: res.departmentId, name: res.departmentName || '', code: '', active: true } : undefined,
        active: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: Role) => {
    const creds = PRESET_ACCOUNTS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const logout = () => {
    localStorage.removeItem('dischargebridge_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
