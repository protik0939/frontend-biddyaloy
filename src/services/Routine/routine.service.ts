import { toSameOriginUrl } from "@/lib/same-origin";
import type { DepartmentRoutine } from "@/services/Department/departmentManagement.service";

type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

type ApiError = {
  success: false;
  message?: string;
};

function getApiPath(path: string) {
  return toSameOriginUrl(path);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = (await response.json().catch(() => ({}))) as ApiSuccess<T> | ApiError;

  if (!response.ok || !("success" in raw) || raw.success !== true) {
    const message = (raw as ApiError)?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return raw.data;
}

const toQueryString = (query: {
  sectionId?: string;
  semesterId?: string;
  teacherInitial?: string;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();

  if (query.sectionId?.trim()) {
    searchParams.set("sectionId", query.sectionId.trim());
  }

  if (query.semesterId?.trim()) {
    searchParams.set("semesterId", query.semesterId.trim());
  }

  if (query.teacherInitial?.trim()) {
    searchParams.set("teacherInitial", query.teacherInitial.trim());
  }

  if (query.search?.trim()) {
    searchParams.set("search", query.search.trim());
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
};

async function listRoutines(query?: {
  sectionId?: string;
  semesterId?: string;
  teacherInitial?: string;
  search?: string;
}) {
  const response = await fetch(getApiPath(`/api/v1/routines${toQueryString(query ?? {})}`), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<DepartmentRoutine[]>(response);
}

export const RoutineService = {
  listRoutines,
};
