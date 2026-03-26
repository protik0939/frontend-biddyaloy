import type {
  CreateInstitutionApplicationPayload,
  InstitutionType,
} from "@/services/Admin/institutionApplication.service";

export const institutionTypes: InstitutionType[] = [
  "SCHOOL",
  "COLLEGE",
  "UNIVERSITY",
  "TRAINING_CENTER",
  "OTHER",
];

export function emptyForm(): CreateInstitutionApplicationPayload {
  return {
    institutionName: "",
    shortName: "",
    institutionType: "SCHOOL",
    description: "",
    institutionLogo: "",
  };
}

export function formatInstitutionType(type: InstitutionType) {
  return type
    .split("_")
    .map((entry) => `${entry.charAt(0)}${entry.slice(1).toLowerCase()}`)
    .join(" ");
}

export function formatDateDDMMYYYY(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
