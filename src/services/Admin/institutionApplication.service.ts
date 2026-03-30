import { toSameOriginUrl } from "@/lib/same-origin";

export type InstitutionType =
  | "SCHOOL"
  | "COLLEGE"
  | "UNIVERSITY"
  | "TRAINING_CENTER"
  | "OTHER";

export type InstitutionApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InstitutionSubscriptionPlan = "MONTHLY" | "HALF_YEARLY" | "YEARLY";
export type InstitutionSubscriptionPaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export interface InstitutionApplication {
  id: string;
  institutionName: string;
  description: string | null;
  shortName: string | null;
  institutionType: InstitutionType;
  institutionLogo: string | null;
  status: InstitutionApplicationStatus;
  rejectionReason: string | null;
  subscriptionPlan?: InstitutionSubscriptionPlan | null;
  subscriptionAmount?: number | null;
  subscriptionCurrency?: string | null;
  subscriptionMonths?: number | null;
  subscriptionPaymentStatus?: InstitutionSubscriptionPaymentStatus;
  subscriptionTranId?: string | null;
  subscriptionPaidAt?: string | null;
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

export interface InstitutionSubscriptionPricingItem {
  plan: InstitutionSubscriptionPlan;
  label: string;
  amount: number;
  originalAmount: number;
  monthsCovered: number;
  currency: string;
  support: string;
  features: string[];
}

export interface InitiateInstitutionSubscriptionPaymentPayload {
  plan: InstitutionSubscriptionPlan;
}

export interface InitiateInstitutionSubscriptionPaymentResponse {
  applicationId: string;
  plan: InstitutionSubscriptionPlan;
  amount: number;
  currency: string;
  monthsCovered: number;
  tranId: string;
  paymentUrl: string;
}

export interface InstitutionStudentPaymentSummaryItem {
  institutionId: string;
  institutionName: string;
  shortName: string | null;
  totalAmount: number;
  totalPayments: number;
}

export interface InstitutionStudentPaymentItem {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionType: InstitutionType;
  studentProfileId: string;
  studentsId: string | null;
  studentName: string;
  studentEmail: string | null;
  semesterId: string;
  semesterName: string;
  paymentMode: "MONTHLY" | "FULL";
  amount: number;
  currency: string;
  tranId: string;
  paidAt: string | null;
}

export interface InstitutionStudentPaymentReport {
  summary: InstitutionStudentPaymentSummaryItem[];
  payments: InstitutionStudentPaymentItem[];
}

export type InstitutionLeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface InstitutionLeaveRequestItem {
  id: string;
  requesterUserId: string;
  requesterRole: "TEACHER" | "STUDENT";
  institutionId: string;
  status: InstitutionLeaveRequestStatus;
  reason: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  requesterUser?: {
    id: string;
    name: string;
    email: string;
  };
  institution?: {
    id: string;
    name: string;
    shortName: string | null;
    type: InstitutionType;
  };
  reviewedByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
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

export async function getInstitutionSubscriptionPricing() {
  const response = await fetch(getApiPath("/institution-applications/pricing"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionSubscriptionPricingItem[]>(response);
}

export async function initiateInstitutionSubscriptionPayment(
  applicationId: string,
  payload: InitiateInstitutionSubscriptionPaymentPayload,
) {
  const response = await fetch(
    getApiPath(`/institution-applications/admin/${applicationId}/subscription/initiate`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<InitiateInstitutionSubscriptionPaymentResponse>(response);
}

export async function getSuperAdminInstitutionFeePayments(institutionId?: string) {
  const query = institutionId ? `?institutionId=${encodeURIComponent(institutionId)}` : "";
  const response = await fetch(
    getApiPath(`/institution-applications/superadmin/fee-payments${query}`),
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  return parseResponse<InstitutionStudentPaymentReport>(response);
}

export async function getAdminInstitutionFeePayments() {
  const response = await fetch(getApiPath("/institution-applications/admin/fee-payments"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionStudentPaymentReport>(response);
}

export async function getSuperAdminInstitutionLeaveRequests(status?: InstitutionLeaveRequestStatus) {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(getApiPath(`/auth/leave-institution/superadmin${query}`), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<InstitutionLeaveRequestItem[]>(response);
}

export async function reviewSuperAdminInstitutionLeaveRequest(
  requestId: string,
  payload: { status: Extract<InstitutionLeaveRequestStatus, "APPROVED" | "REJECTED"> },
) {
  const response = await fetch(
    getApiPath(`/auth/leave-institution/superadmin/${requestId}/review`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );

  return parseResponse<InstitutionLeaveRequestItem>(response);
}
