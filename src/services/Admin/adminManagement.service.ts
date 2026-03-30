import { toSameOriginUrl } from "@/lib/same-origin";

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

export interface InstitutionAdminDashboardSummary {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    contactNo: string | null;
    presentAddress: string | null;
    permanentAddress: string | null;
    bloodGroup: string | null;
    gender: string | null;
  } | null;
  institution: {
    id: string;
    name: string;
    shortName: string | null;
    institutionLogo: string | null;
    type: string;
  } | null;
  stats: {
    totalFaculties: number;
    totalDepartments: number;
    totalSemesters: number;
    totalTeachers: number;
    totalStudents: number;
    pendingTeacherApplications: number;
    pendingStudentApplications: number;
  };
}

export interface InstitutionAdminProfileUpdatePayload {
  name?: string;
  image?: string;
  contactNo?: string;
  presentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  gender?: string;
}

export interface InstitutionSslCommerzCredentialSettings {
  isConfigured: boolean;
  storeIdMasked: string | null;
  hasStorePassword: boolean;
  baseUrl: string | null;
  updatedAt: string | null;
  isActive: boolean;
}

export interface UpsertInstitutionSslCommerzCredentialPayload {
  storeId?: string;
  storePassword?: string;
  baseUrl?: string;
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

export async function listInstitutionFaculties(search?: string) {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const response = await fetch(getApiPath(`/institution-admin/faculties${query}`), {
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

export async function getInstitutionAdminDashboardSummary() {
  const response = await fetch(getApiPath("/institution-admin/dashboard-summary"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionAdminDashboardSummary>(response);
}

export async function updateInstitutionAdminProfile(payload: InstitutionAdminProfileUpdatePayload) {
  const response = await fetch(getApiPath("/institution-admin/profile"), {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<InstitutionAdminDashboardSummary>(response);
}

export async function getInstitutionSslCommerzCredentialSettings() {
  const response = await fetch(getApiPath("/institution-admin/payment-gateway/sslcommerz"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionSslCommerzCredentialSettings>(response);
}

export async function upsertInstitutionSslCommerzCredentialSettings(
  payload: UpsertInstitutionSslCommerzCredentialPayload,
) {
  const response = await fetch(getApiPath("/institution-admin/payment-gateway/sslcommerz"), {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<InstitutionSslCommerzCredentialSettings>(response);
}
