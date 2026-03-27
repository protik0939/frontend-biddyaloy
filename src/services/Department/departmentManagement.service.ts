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

export interface Batch {
  id: string;
  name: string;
  description: string | null;
}

export interface Section {
  id: string;
  name: string;
  description: string | null;
  sectionCapacity: number | null;
  semesterId: string;
  batchId: string | null;
  semester?: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  batch?: {
    id: string;
    name: string;
  };
}

export interface Course {
  id: string;
  courseCode: string;
  courseTitle: string;
  description: string | null;
  credits: number | null;
  programId: string | null;
  program?: {
    id: string;
    title: string;
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

export interface CourseRegistration {
  id: string;
  registrationDate: string;
  courseId: string;
  studentProfileId: string;
  teacherProfileId: string;
  sectionId: string;
  programId: string | null;
  semesterId: string;
  course: {
    id: string;
    courseCode: string;
    courseTitle: string;
  };
  studentProfile: {
    id: string;
    studentInitial: string;
    studentsId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  teacherProfile: {
    id: string;
    teacherInitial: string;
    teachersId: string;
    designation: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  section: {
    id: string;
    name: string;
    batch?: {
      id: string;
      name: string;
    } | null;
  };
  program: {
    id: string;
    title: string;
  } | null;
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
}

export interface SectionCourseTeacherAssignment {
  id: string;
  sectionId: string;
  courseId: string;
  teacherProfileId: string;
  section: {
    id: string;
    name: string;
    semesterId: string;
    batch?: {
      id: string;
      name: string;
    } | null;
  };
  course: {
    id: string;
    courseCode: string;
    courseTitle: string;
  };
  teacherProfile: {
    id: string;
    teacherInitial: string;
    teachersId: string;
    designation: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
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

export type TeacherJobApplicationStatus = "PENDING" | "SHORTLISTED" | "APPROVED" | "REJECTED";

export interface TeacherApplicationProfileSummary {
  id: string;
  headline: string;
  about: string;
  resumeUrl: string;
  portfolioUrl: string | null;
  skills: string[];
  certifications: string[];
  academicRecords: Array<{
    degree: string;
    institute: string;
    result: string;
    year: number;
  }>;
  experiences: Array<{
    organization: string;
    title: string;
    startDate: string;
    endDate?: string;
    responsibilities?: string;
  }>;
  isComplete: boolean;
  updatedAt: string;
}

export interface DepartmentTeacherJobApplication {
  id: string;
  coverLetter: string | null;
  status: TeacherJobApplicationStatus;
  institutionResponse: string | null;
  reviewedAt: string | null;
  appliedAt: string;
  createdAt: string;
  posting: {
    id: string;
    title: string;
    location: string | null;
  };
  teacherUser: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    teacherApplicationProfile: TeacherApplicationProfileSummary | null;
  };
  reviewerUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  department: {
    id: string;
    fullName: string;
  } | null;
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

async function apiDelete<T>(path: string) {
  const response = await fetch(getApiPath(path), {
    method: "DELETE",
    credentials: "include",
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

  listBatches() {
    return apiGet<Batch[]>("/api/v1/department/batches");
  },

  createBatch(payload: { name: string; description?: string }) {
    return apiPost<Batch>("/api/v1/department/batches", payload);
  },

  updateBatch(batchId: string, payload: { name?: string; description?: string }) {
    return apiPatch<Batch>(`/api/v1/department/batches/${batchId}`, payload);
  },

  deleteBatch(batchId: string) {
    return apiDelete<{ id: string }>(`/api/v1/department/batches/${batchId}`);
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
    batchId: string;
    sectionCapacity?: number;
    description?: string;
  }) {
    return apiPost<Section>("/api/v1/department/sections", payload);
  },

  updateSection(
    sectionId: string,
    payload: {
      name?: string;
      semesterId?: string;
      batchId?: string;
      sectionCapacity?: number;
      description?: string;
    },
  ) {
    return apiPatch<Section>(`/api/v1/department/sections/${sectionId}`, payload);
  },

  deleteSection(sectionId: string) {
    return apiDelete<{ id: string }>(`/api/v1/department/sections/${sectionId}`);
  },

  listCourses() {
    return apiGet<Course[]>("/api/v1/department/courses");
  },

  listPrograms() {
    return apiGet<Program[]>("/api/v1/department/programs");
  },

  createCourse(payload: {
    courseCode: string;
    courseTitle: string;
    credits?: number;
    programId?: string;
    description?: string;
  }) {
    return apiPost<Course>("/api/v1/department/courses", payload);
  },

  updateCourse(
    courseId: string,
    payload: {
      courseCode?: string;
      courseTitle?: string;
      credits?: number;
      description?: string;
    },
  ) {
    return apiPatch<Course>(`/api/v1/department/courses/${courseId}`, payload);
  },

  deleteCourse(courseId: string) {
    return apiDelete<{ id: string }>(`/api/v1/department/courses/${courseId}`);
  },

  listCourseRegistrations() {
    return apiGet<CourseRegistration[]>("/api/v1/department/course-registrations");
  },

  listSectionCourseTeacherAssignments() {
    return apiGet<SectionCourseTeacherAssignment[]>("/api/v1/department/course-teacher-assignments");
  },

  upsertSectionCourseTeacherAssignment(payload: {
    sectionId: string;
    courseId: string;
    teacherProfileId: string;
    semesterId: string;
  }) {
    return apiPost<SectionCourseTeacherAssignment>("/api/v1/department/course-teacher-assignments", payload);
  },

  createCourseRegistration(payload: {
    courseId: string;
    studentProfileId: string;
    sectionId: string;
    programId?: string;
    semesterId: string;
  }) {
    return apiPost<CourseRegistration>("/api/v1/department/course-registrations", payload);
  },

  updateCourseRegistration(
    courseRegistrationId: string,
    payload: {
      courseId?: string;
      studentProfileId?: string;
      sectionId?: string;
      programId?: string;
      semesterId?: string;
      registrationDate?: string;
    },
  ) {
    return apiPatch<CourseRegistration>(
      `/api/v1/department/course-registrations/${courseRegistrationId}`,
      payload,
    );
  },

  deleteCourseRegistration(courseRegistrationId: string) {
    return apiDelete<{ id: string }>(
      `/api/v1/department/course-registrations/${courseRegistrationId}`,
    );
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

  listTeacherApplications(status?: TeacherJobApplicationStatus) {
    const query = status ? `?status=${status}` : "";
    return apiGet<DepartmentTeacherJobApplication[]>(`/api/v1/teacher/applications${query}`);
  },

  reviewTeacherApplication(
    applicationId: string,
    payload: {
      status: Extract<TeacherJobApplicationStatus, "SHORTLISTED" | "APPROVED" | "REJECTED">;
      responseMessage?: string;
      rejectionReason?: string;
      teacherInitial?: string;
      teachersId?: string;
      designation?: string;
      bio?: string;
      departmentId?: string;
    },
  ) {
    return apiPatch<DepartmentTeacherJobApplication>(
      `/api/v1/teacher/applications/${applicationId}/review`,
      payload,
    );
  },
};
