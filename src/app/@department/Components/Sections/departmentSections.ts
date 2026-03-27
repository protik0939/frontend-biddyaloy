import {
  BookOpen,
  GraduationCap,
  Home,
  Layers,
  Megaphone,
  Settings,
  SquareStack,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DepartmentSection =
  | "overview"
  | "profile"
  | "semesters"
  | "batches"
  | "sections"
  | "courses"
  | "courseRegistrations"
  | "teachers"
  | "students"
  | "posts";

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
  { label: "Batches", href: "/batches", section: "batches", Icon: Layers },
  { label: "Sections", href: "/sections", section: "sections", Icon: SquareStack },
  { label: "Courses", href: "/courses", section: "courses", Icon: BookOpen },
  {
    label: "Course Registration",
    href: "/course-registrations",
    section: "courseRegistrations",
    Icon: BookOpen,
  },
  { label: "Teachers", href: "/teachers", section: "teachers", Icon: GraduationCap },
  { label: "Students", href: "/students", section: "students", Icon: Users },
  { label: "Posts", href: "/posts", section: "posts", Icon: Megaphone },
];
