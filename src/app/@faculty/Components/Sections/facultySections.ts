import {
  Building2,
  Home,
  KeySquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type FacultySection =
  | "overview"
  | "profile"
  | "departments"
  | "departmentAccounts";

export interface FacultySidebarItem {
  label: string;
  href: string;
  section: FacultySection;
  Icon: LucideIcon;
}

export const facultySidebarItems: FacultySidebarItem[] = [
  { label: "Overview", href: "/", section: "overview", Icon: Home },
  { label: "Profile", href: "/profile", section: "profile", Icon: Settings },
  {
    label: "Departments",
    href: "/departments",
    section: "departments",
    Icon: Building2,
  },
  {
    label: "Department Accounts",
    href: "/department-accounts",
    section: "departmentAccounts",
    Icon: KeySquare,
  },
];
