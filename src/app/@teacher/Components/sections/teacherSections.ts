import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Home,
  Megaphone,
  SquareStack,
  type LucideIcon,
} from "lucide-react";

export type TeacherSection = "overview" | "sections" | "classworks" | "attendance" | "marks";

export interface TeacherSidebarItem {
  label: string;
  href: string;
  section: TeacherSection;
  Icon: LucideIcon;
}

export const teacherSidebarItems: TeacherSidebarItem[] = [
  { label: "Overview", href: "/", section: "overview", Icon: Home },
  { label: "Sections & Students", href: "/sections", section: "sections", Icon: SquareStack },
  {
    label: "Tasks & Notices",
    href: "/classworks",
    section: "classworks",
    Icon: Megaphone,
  },
  {
    label: "Attendance",
    href: "/attendance",
    section: "attendance",
    Icon: ClipboardList,
  },
  {
    label: "Marks",
    href: "/marks",
    section: "marks",
    Icon: GraduationCap,
  },
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
  QUIZ: BookOpen,
  NOTICE: Megaphone,
};
