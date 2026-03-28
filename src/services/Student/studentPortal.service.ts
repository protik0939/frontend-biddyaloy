import { toSameOriginUrl } from "@/lib/same-origin";

export type StudentClassworkType = "TASK" | "ASSIGNMENT" | "QUIZ" | "NOTICE";

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
  return "";
}

function getApiPath(path: string) {
  return toSameOriginUrl(`${getApiBase()}${path}`);
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

async function apiPost<T>(path: string, body: object) {
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

async function apiPatch<T>(path: string, body: object) {
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

export interface StudentPortalProfileResponse {
  hasInstitution: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    accountStatus: string;
    contactNo: string | null;
    presentAddress: string | null;
    permanentAddress: string | null;
    bloodGroup: string | null;
    gender: string | null;
  };
  profile: {
    id: string;
    studentsId: string;
    bio: string | null;
    institution: {
      id: string;
      name: string;
      shortName: string | null;
      institutionLogo: string | null;
    } | null;
    department: {
      id: string;
      fullName: string;
      shortName: string | null;
    } | null;
  } | null;
  applicationProfile: StudentApplicationProfile | null;
  applications: StudentAdmissionApplication[];
  stats: {
    totalRegisteredCourses: number;
    pendingTimelineItems: number;
  };
}

export interface StudentAcademicRecord {
  examName: string;
  institute: string;
  result: string;
  year: number;
}

export interface StudentApplicationProfile {
  id: string;
  headline: string;
  about: string;
  documentUrls: string[];
  academicRecords: StudentAcademicRecord[];
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StudentAdmissionApplicationStatus = "PENDING" | "SHORTLISTED" | "APPROVED" | "REJECTED";

export interface StudentAdmissionApplication {
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
  };
  institution: {
    id: string;
    name: string;
    shortName: string | null;
    institutionLogo: string | null;
  } | null;
}

export interface StudentTimelineItem {
  id: string;
  title: string;
  content: string | null;
  type: StudentClassworkType;
  dueAt: string | null;
  createdAt: string;
  section: {
    id: string;
    name: string;
    semester: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
  };
  courses: Array<{
    id: string;
    courseCode: string;
    courseTitle: string;
  }>;
  teacher: {
    id: string;
    teacherInitial: string;
    designation: string;
    user: {
      id: string;
      name: string;
    };
  };
  submission: {
    id: string;
    responseText: string | null;
    attachmentUrl: string | null;
    attachmentName: string | null;
    submittedAt: string;
    updatedAt: string;
  } | null;
}

export interface StudentRegisteredCourse {
  id: string;
  registrationDate: string;
  course: {
    id: string;
    courseCode: string;
    courseTitle: string;
    credits: number | null;
  };
  section: {
    id: string;
    name: string;
    batch?: {
      id: string;
      name: string;
    } | null;
  };
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  teacherProfile: {
    id: string;
    teacherInitial: string;
    designation: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface StudentResultItem {
  courseRegistrationId: string;
  course: {
    id: string;
    courseCode: string;
    courseTitle: string;
  };
  semester: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  teacher: {
    id: string;
    teacherInitial: string;
    designation: string;
    user: {
      id: string;
      name: string;
    };
  };
  attendance: {
    percentage: number;
    presentClasses: number;
    totalClasses: number;
  };
  marks: Record<string, number | null> | null;
  totalMark: number;
  maxTotal: number;
}

export interface StudentResultResponse {
  semesterId: string;
  summary: {
    totalCourses: number;
    averageAttendancePercentage: number;
    averageResult: number;
  };
  items: StudentResultItem[];
}

export interface StudentSubmission {
  id: string;
  responseText: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  submittedAt: string;
  updatedAt: string;
  classwork: {
    id: string;
    title: string;
    type: StudentClassworkType;
    dueAt: string | null;
    section: {
      id: string;
      name: string;
      semester: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
      };
    };
    teacherProfile: {
      id: string;
      teacherInitial: string;
      designation: string;
      user: {
        id: string;
        name: string;
      };
    };
  };
}

export interface StudentSubmissionPayload {
  classworkId: string;
  responseText?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface StudentSubmissionUpdatePayload {
  responseText?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface StudentProfileUpdatePayload {
  name?: string;
  image?: string;
  bio?: string;
  contactNo?: string;
  presentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  gender?: string;
}

export interface StudentFeeStatus {
  status: string;
  message: string;
}

function toQueryString(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.append(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function getProfileOverview() {
  return apiGet<StudentPortalProfileResponse>("/api/v1/student/profile");
}

async function updateProfile(payload: StudentProfileUpdatePayload) {
  return apiPatch<StudentPortalProfileResponse>("/api/v1/student/profile", payload);
}

async function getApplicationProfile() {
  return apiGet<StudentApplicationProfile | null>("/api/v1/student/application-profile");
}

async function createApplicationProfile(payload: {
  headline: string;
  about: string;
  documentUrls: string[];
  academicRecords: StudentAcademicRecord[];
}) {
  return apiPost<StudentApplicationProfile>("/api/v1/student/application-profile", payload);
}

async function updateApplicationProfile(payload: {
  headline?: string;
  about?: string;
  documentUrls?: string[];
  academicRecords?: StudentAcademicRecord[];
}) {
  return apiPatch<StudentApplicationProfile>("/api/v1/student/application-profile", payload);
}

async function deleteApplicationProfile() {
  return apiDelete<{ id: string }>("/api/v1/student/application-profile");
}

async function applyToAdmissionPosting(postingId: string, payload?: { coverLetter?: string }) {
  return apiPost<StudentAdmissionApplication>(
    `/api/v1/student/admission-applications/${postingId}`,
    payload ?? {},
  );
}

async function listMyAdmissionApplications() {
  return apiGet<StudentAdmissionApplication[]>("/api/v1/student/admission-applications");
}

async function listTimeline(query?: { semesterId?: string; type?: StudentClassworkType; search?: string }) {
  const queryString = toQueryString({ semesterId: query?.semesterId, type: query?.type, search: query?.search });
  return apiGet<StudentTimelineItem[]>(`/api/v1/student/timeline${queryString}`);
}

async function listRegisteredCourses(query?: { semesterId?: string; search?: string }) {
  const queryString = toQueryString({ semesterId: query?.semesterId, search: query?.search });
  return apiGet<StudentRegisteredCourse[]>(`/api/v1/student/registered-courses${queryString}`);
}

async function listResults(query: { semesterId: string }) {
  const queryString = toQueryString({ semesterId: query.semesterId });
  return apiGet<StudentResultResponse>(`/api/v1/student/results${queryString}`);
}

async function listSubmissions(query?: { classworkId?: string; semesterId?: string; search?: string }) {
  const queryString = toQueryString({ classworkId: query?.classworkId, semesterId: query?.semesterId, search: query?.search });
  return apiGet<StudentSubmission[]>(`/api/v1/student/submissions${queryString}`);
}

async function createSubmission(payload: StudentSubmissionPayload) {
  return apiPost<StudentSubmission>("/api/v1/student/submissions", payload);
}

async function updateSubmission(submissionId: string, payload: StudentSubmissionUpdatePayload) {
  return apiPatch<StudentSubmission>(`/api/v1/student/submissions/${submissionId}`, payload);
}

async function deleteSubmission(submissionId: string) {
  return apiDelete<{ id: string }>(`/api/v1/student/submissions/${submissionId}`);
}

async function getFeeStatus() {
  return apiGet<StudentFeeStatus>("/api/v1/student/fees");
}

export const StudentPortalService = {
  getProfileOverview,
  getApplicationProfile,
  createApplicationProfile,
  updateApplicationProfile,
  deleteApplicationProfile,
  applyToAdmissionPosting,
  listMyAdmissionApplications,
  updateProfile,
  listTimeline,
  listRegisteredCourses,
  listResults,
  listSubmissions,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getFeeStatus,
};
