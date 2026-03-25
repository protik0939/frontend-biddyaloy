import {
  Building2,
  FileClock,
  GraduationCap,
  Home,
  LineChart,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SuperAdminSection =
  | "overview"
  | "admins"
  | "institutions"
  | "students"
  | "teachers"
  | "reports"
  | "applications"
  | "settings";

export interface SuperAdminSidebarItem {
  label: string;
  href: string;
  section: SuperAdminSection;
  Icon: LucideIcon;
}

export const superAdminSidebarItems: SuperAdminSidebarItem[] = [
  { label: "Overview", href: "/", section: "overview", Icon: Home },
  { label: "Admins", href: "/admins", section: "admins", Icon: ShieldCheck },
  {
    label: "Institutions",
    href: "/institutions",
    section: "institutions",
    Icon: Building2,
  },
  { label: "Students", href: "/students", section: "students", Icon: Users },
  {
    label: "Teachers",
    href: "/teachers",
    section: "teachers",
    Icon: GraduationCap,
  },
  { label: "Reports", href: "/reports", section: "reports", Icon: LineChart },
  {
    label: "Applications",
    href: "/applications",
    section: "applications",
    Icon: FileClock,
  },
  {
    label: "Settings",
    href: "/settings",
    section: "settings",
    Icon: Settings,
  },
];
