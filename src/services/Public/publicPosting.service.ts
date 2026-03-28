import { toSameOriginUrl } from "@/lib/same-origin";

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
  return toSameOriginUrl(`${getApiBase()}/api/v1${path}`);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = (await response.json().catch(() => ({}))) as ApiSuccess<T> | ApiError;

  if (!response.ok || !("success" in raw) || raw.success !== true) {
    const message = (raw as ApiError)?.message ?? "Request failed";
    throw new Error(message);
  }

  return raw.data;
}

export interface PublicPostingItem {
  id: string;
  title: string;
  summary: string;
  details: string[];
  location: string | null;
  createdAt: string;
  institution: string;
  institutionShortName: string | null;
  institutionLogo: string | null;
  facultyName: string | null;
  departmentName: string | null;
  programTitle: string | null;
}

export async function listTeacherJobPosts() {
  const response = await fetch(getApiPath("/postings/teacher/public"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<PublicPostingItem[]>(response);
}

export async function listStudentAdmissionPosts() {
  const response = await fetch(getApiPath("/postings/student/public"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<PublicPostingItem[]>(response);
}
