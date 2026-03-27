export type InstitutionType =
  | "SCHOOL"
  | "COLLEGE"
  | "UNIVERSITY"
  | "TRAINING_CENTER"
  | "OTHER";

export type InstitutionApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface InstitutionApplication {
  id: string;
  institutionName: string;
  description: string | null;
  shortName: string | null;
  institutionType: InstitutionType;
  institutionLogo: string | null;
  status: InstitutionApplicationStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  applicantUser?: {
    id: string;
    name: string;
    email: string;
  };
  reviewerUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  institution?: {
    id: string;
    institutionName: string;
    shortName: string | null;
    institutionType: InstitutionType;
  } | null;
}

export interface CreateInstitutionApplicationPayload {
  institutionName: string;
  description?: string;
  shortName?: string;
  institutionType: InstitutionType;
  institutionLogo?: string;
}

export interface ReviewInstitutionApplicationPayload {
  status: Extract<InstitutionApplicationStatus, "APPROVED" | "REJECTED">;
  rejectionReason?: string;
}

export interface SuperAdminDashboardSummary {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  stats: {
    totalInstitutions: number;
    totalStudents: number;
    totalTeachers: number;
    totalStaffAccounts: number;
    activeSessions: number;
    pendingApplications: number;
    approvedToday: number;
    rejectedApplications: number;
    newSignupsLast7Days: number;
    weeklyGrowthPercentage: number;
    pendingInstitutionVerifications: number;
    newInstitutionsThisMonth: number;
    newAdmissionsThisMonth: number;
    pendingTeacherApprovals: number;
    verifiedTeacherProfiles: number;
    institutionTypeBreakdown: Record<string, number>;
  };
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

export async function getMyInstitutionApplications() {
  const response = await fetch(getApiPath("/institution-applications/admin/my-applications"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionApplication[]>(response);
}

export async function createInstitutionApplication(payload: CreateInstitutionApplicationPayload) {
  const response = await fetch(getApiPath("/institution-applications/admin/apply"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseResponse<InstitutionApplication>(response);
}

export async function getInstitutionApplicationsForSuperAdmin(status?: InstitutionApplicationStatus) {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(getApiPath(`/institution-applications/superadmin${query}`), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionApplication[]>(response);
}

export async function reviewInstitutionApplication(
  applicationId: string,
  payload: ReviewInstitutionApplicationPayload,
) {
  const response = await fetch(
    getApiPath(`/institution-applications/superadmin/${applicationId}/review`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<InstitutionApplication>(response);
}

export async function getSuperAdminDashboardSummary() {
  const response = await fetch(getApiPath("/institution-applications/superadmin-summary"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<SuperAdminDashboardSummary>(response);
}
