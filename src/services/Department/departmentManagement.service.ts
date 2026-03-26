export type AccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "DEACTIVATED"
  | "BANNED"
  | "DELETIONPENDING"
  | "DELETED";

export interface DepartmentProfile {
  id: string;
  fullName: string;
  shortName: string | null;
  description: string | null;
  institutionId: string;
  facultyId: string | null;
  faculty: { fullName: string } | null;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Section {
  id: string;
  name: string;
  description: string | null;
  sectionCapacity: number | null;
  semesterId: string;
  semester?: {
    id: string;
    name: string;
  };
}

export interface Program {
  id: string;
  title: string;
  shortTitle: string | null;
  description: string | null;
  credits: number | null;
  cost: number | null;
}

export interface Course {
  id: string;
  courseCode: string;
  courseTitle: string;
  description: string | null;
  programId: string;
  program?: {
    id: string;
    title: string;
  };
}

export interface Teacher {
  id: string;
  teacherInitial: string;
  teachersId: string;
  designation: string;
  bio: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
  };
}

export interface Student {
  id: string;
  studentInitial: string;
  studentsId: string;
  bio: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
  };
}

type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

type ApiError = {
  success: false;
  message?: string;
  error?: unknown;
  errors?: unknown;
};

function getApiBase() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function getApiPath(path: string) {
  return `${getApiBase()}${path}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = (await response.json().catch(() => ({}))) as ApiSuccess<T> | ApiError;

  if (!response.ok || !("success" in raw) || raw.success !== true) {
    const message = (raw as ApiError)?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return raw.data;
}

async function apiGet<T>(path: string) {
  const response = await fetch(getApiPath(path), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

async function apiPost<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(getApiPath(path), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseResponse<T>(response);
}

async function apiPatch<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(getApiPath(path), {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseResponse<T>(response);
}

export const DepartmentManagementService = {
  getProfile() {
    return apiGet<DepartmentProfile>("/api/v1/department/profile");
  },

  updateProfile(payload: {
    fullName: string;
    shortName?: string;
    description?: string;
  }) {
    return apiPatch<DepartmentProfile>("/api/v1/department/profile", payload);
  },

  listSemesters() {
    return apiGet<Semester[]>("/api/v1/department/semesters");
  },

  createSemester(payload: { name: string; startDate: string; endDate: string }) {
    return apiPost<Semester>("/api/v1/department/semesters", payload);
  },

  listSections() {
    return apiGet<Section[]>("/api/v1/department/sections");
  },

  createSection(payload: {
    name: string;
    semesterId: string;
    sectionCapacity?: number;
    description?: string;
  }) {
    return apiPost<Section>("/api/v1/department/sections", payload);
  },

  listPrograms() {
    return apiGet<Program[]>("/api/v1/department/programs");
  },

  createProgram(payload: {
    title: string;
    shortTitle?: string;
    description?: string;
    credits?: number;
    cost?: number;
  }) {
    return apiPost<Program>("/api/v1/department/programs", payload);
  },

  listCourses() {
    return apiGet<Course[]>("/api/v1/department/courses");
  },

  createCourse(payload: {
    courseCode: string;
    courseTitle: string;
    programId: string;
    description?: string;
  }) {
    return apiPost<Course>("/api/v1/department/courses", payload);
  },

  listTeachers() {
    return apiGet<Teacher[]>("/api/v1/department/teachers");
  },

  createTeacher(payload: {
    name: string;
    email: string;
    password: string;
    teacherInitial: string;
    teachersId: string;
    designation: string;
    bio?: string;
  }) {
    return apiPost<Teacher>("/api/v1/department/teachers", payload);
  },

  updateTeacherStatus(teacherProfileId: string, accountStatus: AccountStatus) {
    return apiPatch<Teacher>(`/api/v1/department/teachers/${teacherProfileId}`, {
      accountStatus,
    });
  },

  listStudents() {
    return apiGet<Student[]>("/api/v1/department/students");
  },

  createStudent(payload: {
    name: string;
    email: string;
    password: string;
    studentInitial: string;
    studentsId: string;
    bio?: string;
  }) {
    return apiPost<Student>("/api/v1/department/students", payload);
  },

  updateStudentStatus(studentProfileId: string, accountStatus: AccountStatus) {
    return apiPatch<Student>(`/api/v1/department/students/${studentProfileId}`, {
      accountStatus,
    });
  },
};
