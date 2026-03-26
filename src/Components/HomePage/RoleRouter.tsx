'use client';

import { useAuth } from '@/contexts/AuthContext';
import SuperAdminHome from '../../app/@superadmin/Components/Homepage/SuperAdminHome';
import AdminHome from './AdminHome';
import FacultyHome from './FacultyHome';
import DepartmentHome from './DepartmentHome';
import TeacherHome from './TeacherHome';
import StudentHome from './StudentHome';
import UnauthenticatedHome from '../../app/@unauthenticated/Components/HomePage/UnauthenticatedHome';

export default function RoleRouter() {
  const { userRole } = useAuth();

  switch (userRole) {
    case 'SUPERADMIN':
      return <SuperAdminHome section="overview" />;
    case 'ADMIN':
      return <AdminHome />;
    case 'FACULTY':
      return <FacultyHome />;
    case 'DEPARTMENT':
      return <DepartmentHome />;
    case 'TEACHER':
      return <TeacherHome />;
    case 'STUDENT':
      return <StudentHome />;
    case 'UNAUTHENTICATED':
    default:
      return <UnauthenticatedHome />;
  }
}
