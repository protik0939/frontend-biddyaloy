export type InstitutionSubAdminAccountType = "FACULTY" | "DEPARTMENT";

export interface CreateInstitutionSubAdminPayload {
  name: string;
  email: string;
  password: string;
  accountType: InstitutionSubAdminAccountType;
  facultyId?: string;
  facultyFullName?: string;
  facultyShortName?: string;
  facultyDescription?: string;
  departmentFullName?: string;
  departmentShortName?: string;
  departmentDescription?: string;
}

export interface InstitutionSubAdminAccount {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  adminRole: "FACULTYADMIN" | "DEPARTMENTADMIN";
  institutionId: string;
  createdAt: string;
  faculty?: {
    id: string;
    fullName: string;
  } | null;
  department?: {
    id: string;
    fullName: string;
  } | null;
}

export interface InstitutionFacultyOption {
  id: string;
  fullName: string;
  shortName: string | null;
}

export interface InstitutionSemester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  institutionId: string;
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

export async function createInstitutionSubAdminAccount(payload: CreateInstitutionSubAdminPayload) {
  const response = await fetch(getApiPath("/institution-admin/sub-admins"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseResponse<InstitutionSubAdminAccount>(response);
}

export async function listInstitutionFaculties() {
  const response = await fetch(getApiPath("/institution-admin/faculties"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionFacultyOption[]>(response);
}

export async function listInstitutionSemesters() {
  const response = await fetch(getApiPath("/institution-admin/semesters"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionSemester[]>(response);
}

export async function createInstitutionSemester(payload: {
  name: string;
  startDate: string;
  endDate: string;
}) {
  const response = await fetch(getApiPath("/institution-admin/semesters"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<InstitutionSemester>(response);
}

export async function updateInstitutionSemester(
  semesterId: string,
  payload: {
    name?: string;
    startDate?: string;
    endDate?: string;
  },
) {
  const response = await fetch(getApiPath(`/institution-admin/semesters/${semesterId}`), {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<InstitutionSemester>(response);
}

export async function deleteInstitutionSemester(semesterId: string) {
  const response = await fetch(getApiPath(`/institution-admin/semesters/${semesterId}`), {
    method: "DELETE",
    credentials: "include",
  });

  return parseResponse<{ id: string }>(response);
}
