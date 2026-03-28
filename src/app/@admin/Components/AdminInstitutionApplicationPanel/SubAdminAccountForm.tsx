import { useEffect, useMemo, useState } from "react";
import { Loader2, UserPlus2 } from "lucide-react";

import type {
  CreateInstitutionSubAdminPayload,
  InstitutionFacultyOption,
  InstitutionSubAdminAccountType,
} from "@/services/Admin/adminManagement.service";
import SearchableSelect from "@/Components/ui/SearchableSelect";

type Props = Readonly<{
  accountType: InstitutionSubAdminAccountType;
  facultyOptions: InstitutionFacultyOption[];
  facultyOptionsLoading?: boolean;
  facultySearchTerm?: string;
  onFacultySearchChange?: (value: string) => void;
  disabled?: boolean;
  title: string;
  description: string;
  onSubmit: (payload: CreateInstitutionSubAdminPayload) => Promise<void>;
}>;

function emptyCreatePayload(accountType: InstitutionSubAdminAccountType): CreateInstitutionSubAdminPayload {
  return {
    name: "",
    email: "",
    password: "",
    accountType,
    facultyId: "",
    facultyFullName: "",
    facultyShortName: "",
    facultyDescription: "",
    departmentFullName: "",
    departmentShortName: "",
    departmentDescription: "",
  };
}

export default function SubAdminAccountForm({
  accountType,
  facultyOptions,
  facultyOptionsLoading,
  facultySearchTerm,
  onFacultySearchChange,
  disabled,
  title,
  description,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateInstitutionSubAdminPayload>(emptyCreatePayload(accountType));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(emptyCreatePayload(accountType));
  }, [accountType]);

  const canSubmit = useMemo(() => {
    const hasFacultyName = (form.facultyFullName ?? "").trim().length >= 2;
    const hasDepartmentName = (form.departmentFullName ?? "").trim().length >= 2;
    const hasFacultySelection = (form.facultyId ?? "").trim().length > 0;

    if (accountType === "FACULTY") {
      return (
        form.name.trim().length >= 2 &&
        form.email.trim().length >= 5 &&
        form.password.length >= 8 &&
        hasFacultyName &&
        !disabled
      );
    }

    return (
      form.name.trim().length >= 2 &&
      form.email.trim().length >= 5 &&
      form.password.length >= 8 &&
      hasFacultySelection &&
      hasDepartmentName &&
      !disabled
    );
  }, [accountType, disabled, form]);

  const facultySelectPlaceholder = useMemo(() => {
    if (facultyOptionsLoading) {
      return "Loading faculties...";
    }

    if (facultyOptions.length > 0) {
      return "Select a faculty";
    }

    return "No faculties found";
  }, [facultyOptions, facultyOptionsLoading]);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        facultyId: form.facultyId?.trim() || undefined,
        facultyFullName:
          accountType === "FACULTY" ? form.facultyFullName?.trim() || undefined : undefined,
        facultyShortName:
          accountType === "FACULTY" ? form.facultyShortName?.trim() || undefined : undefined,
        facultyDescription:
          accountType === "FACULTY" ? form.facultyDescription?.trim() || undefined : undefined,
        departmentFullName: form.departmentFullName?.trim() || undefined,
        departmentShortName: form.departmentShortName?.trim() || undefined,
        departmentDescription: form.departmentDescription?.trim() || undefined,
      });
      setForm(emptyCreatePayload(accountType));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Full Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="Enter full name"
            disabled={disabled || submitting}
            required
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Account Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="name@institution.edu"
            disabled={disabled || submitting}
            required
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Temporary Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            placeholder="Strong password"
            disabled={disabled || submitting}
            required
          />
          <p className="text-xs text-muted-foreground">
            At least 8 chars with uppercase, lowercase, number and special character.
          </p>
        </label>

        {accountType === "FACULTY" && (
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-3">
            <p className="text-sm font-semibold">Faculty Details</p>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Faculty Full Name</span>
              <input
                value={form.facultyFullName ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, facultyFullName: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="e.g. Faculty of Science"
                disabled={disabled || submitting}
                required
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Faculty Short Name (Optional)</span>
              <input
                value={form.facultyShortName ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, facultyShortName: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="e.g. SCI"
                disabled={disabled || submitting}
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Faculty Description (Optional)</span>
              <textarea
                value={form.facultyDescription ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, facultyDescription: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="Brief faculty description"
                disabled={disabled || submitting}
                rows={3}
              />
            </label>
          </div>
        )}

        {accountType === "DEPARTMENT" && (
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-3">
            <p className="text-sm font-semibold">Select Faculty</p>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Faculty</span>
              <SearchableSelect
                value={form.facultyId ?? ""}
                onChange={(nextValue) => setForm((prev) => ({ ...prev, facultyId: nextValue }))}
                options={facultyOptions.map((faculty) => ({
                  value: faculty.id,
                  label: faculty.shortName ? `${faculty.fullName} (${faculty.shortName})` : faculty.fullName,
                }))}
                placeholder={facultySelectPlaceholder}
                searchPlaceholder="Search faculty..."
                emptyText="No faculty found"
                searchValue={facultySearchTerm ?? ""}
                onSearchValueChange={onFacultySearchChange}
                disabled={disabled || submitting || facultyOptionsLoading || facultyOptions.length === 0}
              />
            </label>

            <div className="rounded-lg border border-border/70 bg-background/60 p-3 space-y-3">
            <p className="text-sm font-semibold">Department Details</p>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Department Full Name</span>
              <input
                value={form.departmentFullName ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, departmentFullName: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="e.g. Department of Mathematics"
                disabled={disabled || submitting}
                required
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Department Short Name (Optional)</span>
              <input
                value={form.departmentShortName ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, departmentShortName: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="e.g. MATH"
                disabled={disabled || submitting}
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-medium">Department Description (Optional)</span>
              <textarea
                value={form.departmentDescription ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, departmentDescription: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="Brief department description"
                disabled={disabled || submitting}
                rows={3}
              />
            </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus2 className="h-4 w-4" />}
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
