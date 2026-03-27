export type AttendanceStatus = "PRESENT" | "ABSENT";
export type TeacherClassworkType = "TASK" | "ASSIGNMENT" | "QUIZ" | "NOTICE";
export type TeacherApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

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

export interface TeacherPortalProfileResponse {
  hasInstitution: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    role: string;
  };
  profile: {
    id: string;
    teacherInitial: string;
    teachersId: string;
    designation: string;
    bio: string | null;
    institutionId: string;
    institution: {
      id: string;
      name: string;
      shortName: string | null;
      institutionLogo: string | null;
    };
    department: {
      id: string;
      fullName: string;
      shortName: string | null;
    } | null;
  } | null;
  applications: TeacherJobApplication[];
}

export interface TeacherJobApplication {
  id: string;
  coverLetter: string | null;
  status: TeacherApplicationStatus;
  institutionResponse: string | null;
  appliedAt: string;
  reviewedAt: string | null;
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
  };
  department: {
    id: string;
    fullName: string;
  } | null;
}

export interface TeacherAssignedSection {
  section: {
    id: string;
    name: string;
    description: string | null;
    sectionCapacity: number | null;
    semester: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
    batch: {
      id: string;
      name: string;
    } | null;
  };
  students: Array<{
    courseRegistrationId: string;
    course: {
      id: string;
      courseCode: string;
      courseTitle: string;
    };
    studentProfile: {
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
    };
  }>;
}

export interface TeacherClasswork {
  id: string;
  title: string;
  content: string | null;
  type: TeacherClassworkType;
  dueAt: string | null;
  createdAt: string;
  section: {
    id: string;
    name: string;
    semester?: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
    batch?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface TeacherAttendanceItem {
  courseRegistrationId: string;
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
  course: {
    id: string;
    courseCode: string;
    courseTitle: string;
  };
  status: AttendanceStatus;
  attendanceId: string | null;
}

export interface TeacherAttendanceResponse {
  sectionId: string;
  date: string;
  items: TeacherAttendanceItem[];
}

export interface TeacherSectionMarkRow {
  courseRegistrationId: string;
  isLabCourse: boolean;
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
  marks: {
    id?: string;
    labReport?: number | null;
    labTask?: number | null;
    project?: number | null;
    projectReport?: number | null;
    presentation?: number | null;
    labEvaluation?: number | null;
    viva?: number | null;
    quiz1?: number | null;
    quiz2?: number | null;
    quiz3?: number | null;
    assignment?: number | null;
    midterm?: number | null;
    finalExam?: number | null;
  } | null;
  attendance: {
    percentage: number;
    mark: number;
    max: number;
    totalClasses: number;
    presentClasses: number;
  };
  quizAverage: number | null;
  totalMark: number;
  maxTotal: number;
}

export interface TeacherMarkUpsertPayload {
  labReport?: number;
  labTask?: number;
  project?: number;
  projectReport?: number;
  presentation?: number;
  labEvaluation?: number;
  viva?: number;
  quiz1?: number;
  quiz2?: number;
  quiz3?: number;
  assignment?: number;
  midterm?: number;
  finalExam?: number;
}

export const TeacherPortalService = {
  getProfileOverview() {
    return apiGet<TeacherPortalProfileResponse>("/api/v1/teacher/profile");
  },

  applyToTeacherPosting(postingId: string, payload?: { coverLetter?: string }) {
    return apiPost<TeacherJobApplication>(`/api/v1/teacher/job-applications/${postingId}`, payload ?? {});
  },

  listMyApplications() {
    return apiGet<TeacherJobApplication[]>("/api/v1/teacher/job-applications");
  },

  listSectionsWithStudents() {
    return apiGet<TeacherAssignedSection[]>("/api/v1/teacher/sections");
  },

  listClassworks(params?: { sectionId?: string; type?: TeacherClassworkType }) {
    const searchParams = new URLSearchParams();
    if (params?.sectionId) {
      searchParams.set("sectionId", params.sectionId);
    }
    if (params?.type) {
      searchParams.set("type", params.type);
    }

    const query = searchParams.toString();
    const path = query
      ? `/api/v1/teacher/classworks?${query}`
      : "/api/v1/teacher/classworks";

    return apiGet<TeacherClasswork[]>(path);
  },

  createClasswork(payload: {
    sectionId: string;
    type: TeacherClassworkType;
    title: string;
    content?: string;
    dueAt?: string;
  }) {
    return apiPost<TeacherClasswork>("/api/v1/teacher/classworks", payload);
  },

  updateClasswork(
    classworkId: string,
    payload: {
      type?: TeacherClassworkType;
      title?: string;
      content?: string;
      dueAt?: string;
    },
  ) {
    return apiPatch<TeacherClasswork>(`/api/v1/teacher/classworks/${classworkId}`, payload);
  },

  deleteClasswork(classworkId: string) {
    return apiDelete<{ id: string }>(`/api/v1/teacher/classworks/${classworkId}`);
  },

  getAttendance(sectionId: string, date: string) {
    const query = new URLSearchParams({ sectionId, date }).toString();
    return apiGet<TeacherAttendanceResponse>(`/api/v1/teacher/attendance?${query}`);
  },

  submitAttendance(payload: {
    sectionId: string;
    date: string;
    items: Array<{ courseRegistrationId: string; status: AttendanceStatus }>;
  }) {
    return apiPost<TeacherAttendanceResponse>("/api/v1/teacher/attendance", payload);
  },

  listMarks(sectionId: string) {
    const query = new URLSearchParams({ sectionId }).toString();
    return apiGet<TeacherSectionMarkRow[]>(`/api/v1/teacher/marks?${query}`);
  },

  upsertMark(courseRegistrationId: string, payload: TeacherMarkUpsertPayload) {
    return apiPost<TeacherSectionMarkRow>(
      `/api/v1/teacher/marks/${courseRegistrationId}`,
      payload as Record<string, unknown>,
    );
  },
};
