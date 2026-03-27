import {
  BookOpen,
  GraduationCap,
  Home,
  Layers,
  Megaphone,
  ScrollText,
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
  | "courseTeacherAssignments"
  | "courseRegistrations"
  | "teachers"
  | "teacherApplications"
  | "studentApplications"
  | "students"
  | "posts";

export interface DepartmentSidebarItem {
  label: string;
  href: string;
  section: DepartmentSection;
  Icon: LucideIcon;
}

const replaceAcademicTerms = (value: string, isUniversity: boolean) => {
  if (isUniversity) {
    return value;
  }

  return value
    .replaceAll("Department", "Program")
    .replaceAll("department", "program")
    .replaceAll("Semester", "Session")
    .replaceAll("semester", "session")
    .replaceAll("Batch", "Class")
    .replaceAll("batch", "class");
};

export const getDepartmentSidebarItems = (isUniversity: boolean): DepartmentSidebarItem[] => [
  { label: "Overview", href: "/", section: "overview", Icon: Home },
  { label: "Profile", href: "/profile", section: "profile", Icon: Settings },
  {
    label: replaceAcademicTerms("Semesters", isUniversity),
    href: "/semesters",
    section: "semesters",
    Icon: Layers,
  },
  {
    label: replaceAcademicTerms("Batches", isUniversity),
    href: "/batches",
    section: "batches",
    Icon: Layers,
  },
  { label: "Sections", href: "/sections", section: "sections", Icon: SquareStack },
  { label: "Courses", href: "/courses", section: "courses", Icon: BookOpen },
  {
    label: "Course Teacher Assignment",
    href: "/course-teacher-assignments",
    section: "courseTeacherAssignments",
    Icon: BookOpen,
  },
  {
    label: "Course Registration",
    href: "/course-registrations",
    section: "courseRegistrations",
    Icon: BookOpen,
  },
  {
    label: "Teacher Applications",
    href: "/teacher-applications",
    section: "teacherApplications",
    Icon: ScrollText,
  },
  {
    label: "Student Applications",
    href: "/student-applications",
    section: "studentApplications",
    Icon: ScrollText,
  },
  { label: "Teachers", href: "/teachers", section: "teachers", Icon: GraduationCap },
  { label: "Students", href: "/students", section: "students", Icon: Users },
  { label: "Posts", href: "/posts", section: "posts", Icon: Megaphone },
];
