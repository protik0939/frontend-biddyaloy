'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RoleRendererProps {
  superadmin: React.ReactNode;
  admin: React.ReactNode;
  faculty: React.ReactNode;
  department: React.ReactNode;
  teacher: React.ReactNode;
  student: React.ReactNode;
  unauthenticated: React.ReactNode;
}

export default function RoleRenderer({
  superadmin,
  admin,
  faculty,
  department,
  teacher,
  student,
  unauthenticated,
}: Readonly<RoleRendererProps>) {
  const { userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (userRole === 'UNAUTHENTICATED' && pathname === '/subscription-expired') {
      router.replace('/login');
      return;
    }

    if (userRole === 'UNAUTHENTICATED') {
      return;
    }

    let cancelled = false;

    const verifyAccess = async () => {
      try {
        const response = await fetch('/api/v1/auth/access-status', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          code?: string;
        };

        if (
          !cancelled &&
          response.status === 402 &&
          payload.code === 'INSTITUTION_SUBSCRIPTION_EXPIRED' &&
          pathname !== '/subscription-expired'
        ) {
          router.replace('/subscription-expired');
        }
      } catch {
        // Avoid navigation on network errors; page-level handlers can display details.
      }
    };

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [userRole, pathname, router]);

  const getRoleContent = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return superadmin;
      case 'ADMIN':
        return admin;
      case 'FACULTY':
        return faculty;
      case 'DEPARTMENT':
        return department;
      case 'TEACHER':
        return teacher;
      case 'STUDENT':
        return student;
      case 'UNAUTHENTICATED':
      default:
        return unauthenticated;
    }
  };

  return (
    <div className="w-full h-screen">
      {getRoleContent()}
    </div>
  );
}
