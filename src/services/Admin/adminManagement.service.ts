export type InstitutionSubAdminAccountType = "FACULTY" | "DEPARTMENT";

export interface CreateInstitutionSubAdminPayload {
  name: string;
  email: string;
  password: string;
  accountType: InstitutionSubAdminAccountType;
}

export interface InstitutionSubAdminAccount {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  adminRole: "FACULTYADMIN" | "DEPARTMENTADMIN";
  institutionId: string;
  createdAt: string;
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
