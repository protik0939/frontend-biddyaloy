'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'FACULTY' | 'DEPARTMENT' | 'TEACHER' | 'STUDENT' | 'UNAUTHENTICATED';

interface AuthContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_ROLES = new Set<UserRole>([
  'SUPERADMIN',
  'ADMIN',
  'FACULTY',
  'DEPARTMENT',
  'TEACHER',
  'STUDENT',
  'UNAUTHENTICATED',
]);

function normalizeRole(value: string | null | undefined): UserRole | null {
  if (!value) {
    return null;
  }

  const normalized = value.toUpperCase();
  return VALID_ROLES.has(normalized as UserRole) ? (normalized as UserRole) : null;
}

function readRoleFromCookie(): UserRole | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const roleCookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('user_role='));

  if (!roleCookie) {
    return null;
  }

  const roleValue = decodeURIComponent(roleCookie.split('=')[1] ?? '');
  return normalizeRole(roleValue);
}

export function AuthProvider({
  children,
  initialRole,
}: Readonly<{ children: ReactNode; initialRole?: UserRole }>) {
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const cookieRole = readRoleFromCookie();

  useEffect(() => {
    if (roleOverride === null) {
      return;
    }

    if (cookieRole === null) {
      setRoleOverride(null);
      return;
    }

    if (cookieRole !== roleOverride) {
      setRoleOverride(cookieRole);
    }
  }, [cookieRole, roleOverride]);

  const userRole = roleOverride ?? cookieRole ?? initialRole ?? 'UNAUTHENTICATED';

  const setUserRole = useCallback((role: UserRole) => {
    setRoleOverride(role);

    if (typeof document !== 'undefined') {
      document.cookie = `user_role=${encodeURIComponent(role)}; path=/; SameSite=Lax`;
    }
  }, []);

  const value = useMemo(() => ({ userRole, setUserRole }), [userRole, setUserRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
