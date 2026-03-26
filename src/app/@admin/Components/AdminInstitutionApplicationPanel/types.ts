import type {
  InstitutionApplication,
  InstitutionType,
  CreateInstitutionApplicationPayload,
} from "@/services/Admin/institutionApplication.service";

export type AdminDashboardSection =
  | "overview"
  | "programs"
  | "workflow"
  | "faculty"
  | "departments"
  | "posts"
  | "settings";

export type InstitutionApplicationFormState = CreateInstitutionApplicationPayload;

export interface DashboardContext {
  latest: InstitutionApplication;
  approvedInstitutionType?: InstitutionType;
}
