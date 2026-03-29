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
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    contactNo?: string | null;
    presentAddress?: string | null;
    permanentAddress?: string | null;
    bloodGroup?: string | null;
    gender?: string | null;
  } | null;
}

import { toSameOriginUrl } from "@/lib/same-origin";

export interface DepartmentDashboardSummary {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  institution: {
    id: string;
    name: string;
    shortName: string | null;
    institutionLogo: string | null;
    type: string | null;
  } | null;
  department: {
    id: string;
    fullName: string;
    shortName: string | null;
    description: string | null;
  } | null;
  stats: {
    totalSemesters: number;
    totalSections: number;
    totalTeachers: number;
    totalCourses: number;
    totalStudents: number;
    pendingTeacherApplications: number;
    pendingStudentApplications: number;
  };
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
export type StudentAdmissionApplicationStatus =
  | "PENDING"
  | "SHORTLISTED"
  | "APPROVED"
  | "REJECTED";

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

export interface StudentApplicationProfileSummary {
  id: string;
  headline: string;
  about: string;
  documentUrls: string[];
  academicRecords: Array<{
    examName: string;
    institute: string;
    result: string;
    year: number;
  }>;
  isComplete: boolean;
  updatedAt: string;
}

export interface DepartmentStudentAdmissionApplication {
  id: string;
  coverLetter: string | null;
  status: StudentAdmissionApplicationStatus;
  institutionResponse: string | null;
  reviewedAt: string | null;
  appliedAt: string;
  createdAt: string;
  posting: {
    id: string;
    title: string;
    location: string | null;
    summary?: string;
    departmentId?: string | null;
  };
  studentUser: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    studentApplicationProfile: StudentApplicationProfileSummary | null;
  };
  reviewerUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  studentProfile: {
    id: string;
    studentsId: string;
    bio: string | null;
  } | null;
}

export interface DepartmentFeeConfiguration {
  id: string;
  semesterId: string;
  totalFeeAmount: number;
  monthlyFeeAmount: number;
  currency: string;
  isActive: boolean;
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  totalPaidAmount: number;
  totalStudentsPaid: number;
  outstandingAmount: number;
}

export interface DepartmentStudentPaymentInfo {
  student: {
    id: string;
    studentsId: string;
    user: {
      id: string;
      name: string;
      email: string;
      accountStatus: string;
    };
  };
  feeSummaries: Array<{
    feeConfigurationId: string;
    semester: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
    totalFeeAmount: number;
    monthlyFeeAmount: number;
    currency: string;
    paidAmount: number;
    dueAmount: number;
  }>;
  paymentHistory: Array<{
    id: string;
    semesterId: string;
    amount: number;
    monthsCovered: number;
    paymentMode: "MONTHLY" | "FULL";
    status: string;
    currency: string;
    tranId: string;
    paidAt: string | null;
    createdAt: string;
    gatewayCardType: string | null;
    gatewayBankTranId: string | null;
    semester: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
  }>;
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

export type ApiFieldError = {
  path: string;
  message: string;
};

export class ApiRequestError extends Error {
  statusCode: number;
  fieldErrors: ApiFieldError[];

  constructor(message: string, statusCode: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

const normalizeApiFieldErrors = (errors: unknown): ApiFieldError[] => {
  if (!Array.isArray(errors)) {
    return [];
  }

  return errors
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const message = "message" in item && typeof item.message === "string" ? item.message : "";
      const path = "path" in item && typeof item.path === "string" ? item.path : "";

      if (!message) {
        return null;
      }

      return {
        path,
        message,
      };
    })
    .filter((item): item is ApiFieldError => Boolean(item));
};

function getApiBase() {
  return "";
}

function getApiPath(path: string) {
  return toSameOriginUrl(`${getApiBase()}${path}`);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = (await response.json().catch(() => ({}))) as ApiSuccess<T> | ApiError;

  if (!response.ok || !("success" in raw) || raw.success !== true) {
    const message = (raw as ApiError)?.message ?? `Request failed with status ${response.status}`;
    throw new ApiRequestError(message, response.status, normalizeApiFieldErrors((raw as ApiError)?.errors));
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
  getDashboardSummary() {
    return apiGet<DepartmentDashboardSummary>("/api/v1/department/dashboard-summary");
  },

  getProfile() {
    return apiGet<DepartmentProfile>("/api/v1/department/profile");
  },

  updateProfile(payload: {
    fullName?: string;
    shortName?: string;
    description?: string;
    name?: string;
    image?: string;
    contactNo?: string;
    presentAddress?: string;
    permanentAddress?: string;
    bloodGroup?: string;
    gender?: string;
  }) {
    return apiPatch<DepartmentProfile>("/api/v1/department/profile", payload);
  },

  listSemesters(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<Semester[]>(`/api/v1/department/semesters${query}`);
  },

  listBatches(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<Batch[]>(`/api/v1/department/batches${query}`);
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

  listSections(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<Section[]>(`/api/v1/department/sections${query}`);
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

  listCourses(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<Course[]>(`/api/v1/department/courses${query}`);
  },

  listPrograms(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<Program[]>(`/api/v1/department/programs${query}`);
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

  listCourseRegistrations(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<CourseRegistration[]>(`/api/v1/department/course-registrations${query}`);
  },

  listSectionCourseTeacherAssignments(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<SectionCourseTeacherAssignment[]>(`/api/v1/department/course-teacher-assignments${query}`);
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

  listTeachers(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<Teacher[]>(`/api/v1/department/teachers${query}`);
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

  listStudents(search?: string) {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiGet<Student[]>(`/api/v1/department/students${query}`);
  },

  createStudent(payload: {
    name: string;
    email: string;
    password: string;
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

  listStudentApplications(status?: StudentAdmissionApplicationStatus) {
    const query = status ? `?status=${status}` : "";
    return apiGet<DepartmentStudentAdmissionApplication[]>(
      `/api/v1/department/student-applications${query}`,
    );
  },

  reviewStudentApplication(
    applicationId: string,
    payload: {
      status: Extract<StudentAdmissionApplicationStatus, "SHORTLISTED" | "APPROVED" | "REJECTED">;
      responseMessage?: string;
      rejectionReason?: string;
      studentsId?: string;
      bio?: string;
    },
  ) {
    return apiPatch<DepartmentStudentAdmissionApplication>(
      `/api/v1/department/student-applications/${applicationId}/review`,
      payload,
    );
  },

  listFeeConfigurations(semesterId?: string) {
    const query = semesterId ? `?semesterId=${encodeURIComponent(semesterId)}` : "";
    return apiGet<DepartmentFeeConfiguration[]>(`/api/v1/department/fees/configurations${query}`);
  },

  upsertFeeConfiguration(payload: {
    semesterId: string;
    totalFeeAmount: number;
    monthlyFeeAmount: number;
    currency?: string;
  }) {
    return apiPost<DepartmentFeeConfiguration>("/api/v1/department/fees/configurations", payload);
  },

  getStudentPaymentInfo(studentsId: string, semesterId?: string) {
    const query = semesterId ? `?semesterId=${encodeURIComponent(semesterId)}` : "";
    return apiGet<DepartmentStudentPaymentInfo>(
      `/api/v1/department/fees/students/${encodeURIComponent(studentsId)}${query}`,
    );
  },
};
