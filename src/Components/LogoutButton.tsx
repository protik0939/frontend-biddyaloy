'use client';

import { logoutAction } from '@/app/@unauthenticated/Components/Authentication/auth-actions';
import { useAuth } from '@/contexts/AuthContext';

const AUTHENTICATED_ROLES = new Set([
  'SUPERADMIN',
  'ADMIN',
  'FACULTY',
  'DEPARTMENT',
  'TEACHER',
  'STUDENT',
]);

export default function LogoutButton() {
  const { userRole } = useAuth();

  if (!AUTHENTICATED_ROLES.has(userRole)) {
    return null;
  }

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg cursor-pointer border border-border/70 bg-card/90 hover:bg-card-foreground/10 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-card"
      >
        Log out
      </button>
    </form>
  );
}
