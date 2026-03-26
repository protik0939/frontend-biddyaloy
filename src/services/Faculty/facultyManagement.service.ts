export interface FacultyProfile {
  userId: string;
  name: string;
  facultyId: string | null;
  facultyName: string | null;
}

export interface FacultyProfileDetails {
  userId: string;
  institutionId: string;
  facultyId: string | null;
  fullName: string;
  shortName: string | null;
  description: string | null;
}

export interface Department {
  id: string;
  fullName: string;
  shortName: string | null;
  description: string | null;
  facultyId: string | null;
  createdAt: string;
}

export interface DepartmentAccount {
  id: string;
  name: string;
  email: string;
  adminRole?: string;
  createdAt?: string;
}

export interface UpdateFacultyNamePayload {
  fullName: string;
  facultyId?: string;
  shortName?: string;
  description?: string;
}

export interface CreateDepartmentPayload {
  fullName: string;
  shortName?: string;
  description?: string;
  facultyId?: string;
}

export interface CreateDepartmentAccountPayload {
  name: string;
  email: string;
  password: string;
  facultyId?: string;
  departmentFullName?: string;
  departmentShortName?: string;
  departmentDescription?: string;
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

async function tryPatchWithFallback<T>(
  endpoints: string[],
  body: Record<string, unknown>,
): Promise<T> {
  let lastError = "Failed to update faculty profile";

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (response.status === 404) {
      continue;
    }

    try {
      return await parseResponse<T>(response);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      if (response.status < 500) {
        break;
      }
    }
  }

  throw new Error(lastError);
}

async function tryPostWithFallback<T>(
  endpoints: string[],
  body: Record<string, unknown>,
  fallbackError: string,
): Promise<T> {
  let lastError = fallbackError;

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (response.status === 404) {
      continue;
    }

    try {
      return await parseResponse<T>(response);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      if (response.status < 500) {
        break;
      }
    }
  }

  throw new Error(lastError);
}

export async function updateFacultyName(payload: UpdateFacultyNamePayload) {
  const endpoints = [
    getApiPath("/api/v1/faculty/profile/name"),
    getApiPath("/api/v1/faculty/profile"),
    getApiPath("/api/auth/update-user"),
  ];

  return tryPatchWithFallback<FacultyProfile>(endpoints, {
    fullName: payload.fullName,
    facultyId: payload.facultyId || undefined,
    shortName: payload.shortName || undefined,
    description: payload.description || undefined,
  });
}

export async function getFacultyProfileDetails() {
  const response = await fetch(getApiPath("/api/v1/faculty/profile"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<FacultyProfileDetails>(response);
}

export async function createDepartment(payload: CreateDepartmentPayload) {
  return tryPostWithFallback<Department>(
    [getApiPath("/api/v1/faculty/departments")],
    {
      fullName: payload.fullName,
      shortName: payload.shortName || undefined,
      description: payload.description || undefined,
      facultyId: payload.facultyId || undefined,
    },
    "Failed to create department",
  );
}

export async function createDepartmentAccount(payload: CreateDepartmentAccountPayload) {
  return tryPostWithFallback<DepartmentAccount>(
    [getApiPath("/api/v1/institution-admin/sub-admins")],
    {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      accountType: "DEPARTMENT",
      facultyId: payload.facultyId || undefined,
      departmentFullName: payload.departmentFullName || undefined,
      departmentShortName: payload.departmentShortName || undefined,
      departmentDescription: payload.departmentDescription || undefined,
    },
    "Failed to create department account",
  );
}
