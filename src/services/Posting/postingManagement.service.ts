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
  return `${getApiBase()}/api/v1${path}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = (await response.json().catch(() => ({}))) as ApiSuccess<T> | ApiError;

  if (!response.ok || !("success" in raw) || raw.success !== true) {
    const message = (raw as ApiError)?.message ?? "Request failed";
    throw new Error(message);
  }

  return raw.data;
}

export type PostingScope = "INSTITUTION" | "FACULTY" | "DEPARTMENT";

export interface PostingFacultyOption {
  id: string;
  fullName: string;
}

export interface PostingDepartmentOption {
  id: string;
  fullName: string;
  facultyId: string | null;
}

export interface PostingOptions {
  faculties: PostingFacultyOption[];
  departments: PostingDepartmentOption[];
}

export interface CreatePostingPayload {
  title: string;
  location?: string;
  summary: string;
  details?: string[];
  facultyId?: string;
  departmentId?: string;
}

export async function getPostingOptions(search?: string) {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const response = await fetch(getApiPath(`/postings/options${query}`), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<PostingOptions>(response);
}

export async function createTeacherJobPost(payload: CreatePostingPayload) {
  const response = await fetch(getApiPath("/postings/teacher"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{ id: string }>(response);
}

export async function createStudentAdmissionPost(payload: CreatePostingPayload) {
  const response = await fetch(getApiPath("/postings/student"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{ id: string }>(response);
}
