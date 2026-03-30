import {
  BookOpen,
  Clock3,
  GraduationCap,
  Home,
  Layers,
  Megaphone,
  Receipt,
  ScrollText,
  Settings,
  SquareStack,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type DepartmentSection =
  | "overview"
  | "profile"
  | "notices"
  | "semesters"
  | "schedules"
  | "batches"
  | "sections"
  | "classrooms"
  | "courses"
  | "routines"
  | "courseTeacherAssignments"
  | "courseRegistrations"
  | "teachers"
  | "teacherApplications"
  | "studentApplications"
  | "students"
  | "transfers"
  | "fees"
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
  { label: "Notices", href: "/notices", section: "notices", Icon: Megaphone },
  {
    label: replaceAcademicTerms("Semesters", isUniversity),
    href: "/semesters",
    section: "semesters",
    Icon: Layers,
  },
  { label: "Class Slots", href: "/class-slots", section: "schedules", Icon: Clock3 },
  {
    label: replaceAcademicTerms("Batches", isUniversity),
    href: "/batches",
    section: "batches",
    Icon: Layers,
  },
  { label: "Sections", href: "/sections", section: "sections", Icon: SquareStack },
  { label: "Courses", href: "/courses", section: "courses", Icon: BookOpen },
  { label: "Routines", href: "/routines", section: "routines", Icon: Clock3 },
  {
    label: "Teacher Assignment",
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
  { label: "Transfers", href: "/transfers", section: "transfers", Icon: Workflow },
  { label: "Fees", href: "/fees", section: "fees", Icon: Receipt },
  { label: "Posts", href: "/posts", section: "posts", Icon: Megaphone },
];
