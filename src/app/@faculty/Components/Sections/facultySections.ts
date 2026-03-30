import {
  Building2,
  DoorOpen,
  Home,
  Clock3,
  Megaphone,
  Settings,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type FacultySection =
  | "overview"
  | "profile"
  | "notices"
  | "routines"
  | "classrooms"
  | "departments"
  | "departmentAccounts"
  | "academicWorkspace"
  | "posts";

export interface FacultySidebarItem {
  label: string;
  href: string;
  section: FacultySection;
  Icon: LucideIcon;
}

export const facultySidebarItems: FacultySidebarItem[] = [
  { label: "Overview", href: "/", section: "overview", Icon: Home },
  { label: "Profile", href: "/profile", section: "profile", Icon: Settings },
  { label: "Notices", href: "/notices", section: "notices", Icon: Megaphone },
  { label: "Routines", href: "/routines", section: "routines", Icon: Clock3 },
  { label: "Rooms", href: "/classrooms", section: "classrooms", Icon: DoorOpen },
  {
    label: "Departments",
    href: "/departments",
    section: "departments",
    Icon: Building2,
  },
  {
    label: "Academic Workspace",
    href: "/academic-workspace",
    section: "academicWorkspace",
    Icon: Workflow,
  },
  { label: "Posts", href: "/posts", section: "posts", Icon: Megaphone },
];
