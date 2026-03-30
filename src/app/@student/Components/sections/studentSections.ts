import {
  BookOpen,
  ClipboardList,
  Clock3,
  GraduationCap,
  Home,
  Receipt,
  Settings,
  Upload,
  type LucideIcon,
} from "lucide-react";

export type StudentSection =
  | "overview"
  | "notices"
  | "routines"
  | "registeredCourses"
  | "results"
  | "submissions"
  | "fees"
  | "profile";

export interface StudentSidebarItem {
  label: string;
  href: string;
  section: StudentSection;
  Icon: LucideIcon;
}

export const studentSidebarItems: StudentSidebarItem[] = [
  { label: "Overview", href: "/", section: "overview", Icon: Home },
  { label: "Notices", href: "/notices", section: "notices", Icon: ClipboardList },
  { label: "Routines", href: "/routines", section: "routines", Icon: Clock3 },
  {
    label: "Registered Courses",
    href: "/registered-courses",
    section: "registeredCourses",
    Icon: BookOpen,
  },
  { label: "Results", href: "/results", section: "results", Icon: GraduationCap },
  { label: "Submissions", href: "/submissions", section: "submissions", Icon: Upload },
  { label: "Pay Fee", href: "/fees", section: "fees", Icon: Receipt },
  { label: "Profile", href: "/profile", section: "profile", Icon: Settings },
];

export const classworkTypeLabel: Record<string, string> = {
  TASK: "Task",
  ASSIGNMENT: "Assignment",
  QUIZ: "Quiz",
  NOTICE: "Notice",
};

export const classworkTypeIcon: Record<string, LucideIcon> = {
  TASK: ClipboardList,
  ASSIGNMENT: BookOpen,
  QUIZ: GraduationCap,
  NOTICE: ClipboardList,
};
