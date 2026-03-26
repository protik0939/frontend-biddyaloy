import {
  BookOpen,
  GraduationCap,
  Home,
  Layers,
  School,
  Settings,
  SquareStack,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DepartmentSection =
  | "overview"
  | "profile"
  | "semesters"
  | "sections"
  | "programs"
  | "courses"
  | "teachers"
  | "students";

export interface DepartmentSidebarItem {
  label: string;
  href: string;
  section: DepartmentSection;
  Icon: LucideIcon;
}

export const departmentSidebarItems: DepartmentSidebarItem[] = [
  { label: "Overview", href: "/", section: "overview", Icon: Home },
  { label: "Profile", href: "/profile", section: "profile", Icon: Settings },
  { label: "Semesters", href: "/semesters", section: "semesters", Icon: Layers },
  { label: "Sections", href: "/sections", section: "sections", Icon: SquareStack },
  { label: "Programs", href: "/programs", section: "programs", Icon: School },
  { label: "Courses", href: "/courses", section: "courses", Icon: BookOpen },
  { label: "Teachers", href: "/teachers", section: "teachers", Icon: GraduationCap },
  { label: "Students", href: "/students", section: "students", Icon: Users },
];
