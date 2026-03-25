'use client';

import React from 'react';
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
