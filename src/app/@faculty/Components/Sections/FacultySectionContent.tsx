"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createDepartment,
  createDepartmentAccount,
  getFacultyProfileDetails,
  updateFacultyName,
  type Department,
} from "@/services/Faculty/facultyManagement.service";

import { type FacultySection } from "./facultySections";

interface FacultySectionContentProps {
  section: FacultySection;
}

export default function FacultySectionContent({
  section,
}: Readonly<FacultySectionContentProps>) {
  const [profileFullName, setProfileFullName] = useState("");
  const [profileShortName, setProfileShortName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileFacultyId, setProfileFacultyId] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [createdDepartments, setCreatedDepartments] = useState<Department[]>([]);

  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  const canUpdateProfile = profileFullName.trim().length >= 2;
  const canCreateDepartment = useMemo(() => {
    return departmentName.trim().length >= 2;
  }, [departmentName]);
  const canCreateAccount = useMemo(() => {
    return (
      accountName.trim().length >= 2 &&
      accountEmail.trim().includes("@") &&
      accountPassword.trim().length >= 6
    );
  }, [accountEmail, accountName, accountPassword]);

  useEffect(() => {
    if (section !== "profile") {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const profile = await getFacultyProfileDetails();
        if (cancelled) {
          return;
        }

        setProfileFullName(profile.fullName ?? "");
        setProfileShortName(profile.shortName ?? "");
        setProfileDescription(profile.description ?? "");
        setProfileFacultyId(profile.facultyId ?? "");
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to load faculty profile";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [section]);

  const onUpdateProfile = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canUpdateProfile) {
      toast.warning("Please provide a valid faculty name");
      return;
    }

    setSavingProfile(true);
    try {
      await updateFacultyName({
        fullName: profileFullName.trim(),
        shortName: profileShortName.trim() || undefined,
        description: profileDescription.trim() || undefined,
        facultyId: profileFacultyId.trim() || undefined,
      });
      toast.success("Faculty profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update faculty profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const onCreateDepartment = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateDepartment) {
      toast.warning("Department name must be at least 2 characters");
      return;
    }

    setCreatingDepartment(true);
    try {
      const created = await createDepartment({
        name: departmentName.trim(),
        code: departmentCode.trim() || undefined,
        description: departmentDescription.trim() || undefined,
      });

      setCreatedDepartments((prev) => [created, ...prev]);
      setDepartmentName("");
      setDepartmentCode("");
      setDepartmentDescription("");
      toast.success("Department created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create department";
      toast.error(message);
    } finally {
      setCreatingDepartment(false);
    }
  };

  const onCreateDepartmentAccount = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateAccount) {
      toast.warning("Provide valid name, email, and password");
      return;
    }

    setCreatingAccount(true);
    try {
      const created = await createDepartmentAccount({
        name: accountName.trim(),
        email: accountEmail.trim(),
        password: accountPassword,
      });

      setAccountName("");
      setAccountEmail("");
      setAccountPassword("");
      toast.success(`Department account created for ${created.email}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create department account";
      toast.error(message);
    } finally {
      setCreatingAccount(false);
    }
  };

  if (section === "overview") {
    return null;
  }

  if (section === "profile") {
    return (
      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Edit Faculty Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update faculty full name, short name, description, and optional faculty id.
        </p>

        <form className="mt-4 space-y-4" onSubmit={onUpdateProfile}>
          {loadingProfile ? (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading current profile...
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="faculty-full-name">
                Full Name
              </label>
              <input
                id="faculty-full-name"
                value={profileFullName}
                onChange={(event) => setProfileFullName(event.target.value)}
                placeholder="Faculty of Science"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="faculty-short-name">
                Short Name (optional)
              </label>
              <input
                id="faculty-short-name"
                value={profileShortName}
                onChange={(event) => setProfileShortName(event.target.value)}
                placeholder="FOS"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="faculty-description">
              Description (optional)
            </label>
            <textarea
              id="faculty-description"
              value={profileDescription}
              onChange={(event) => setProfileDescription(event.target.value)}
              rows={4}
              placeholder="Brief summary of this faculty"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      </article>
    );
  }

  if (section === "departments") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Create Department</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new department under this faculty.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onCreateDepartment}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-name">
                Department Name
              </label>
              <input
                id="department-name"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                placeholder="Computer Science"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-code">
                Code (optional)
              </label>
              <input
                id="department-code"
                value={departmentCode}
                onChange={(event) => setDepartmentCode(event.target.value)}
                placeholder="CSE"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="department-description">
              Description (optional)
            </label>
            <textarea
              id="department-description"
              value={departmentDescription}
              onChange={(event) => setDepartmentDescription(event.target.value)}
              rows={4}
              placeholder="Describe the department..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
            />
          </div>

          <button
            type="submit"
            disabled={creatingDepartment}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingDepartment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Department
          </button>
        </form>

        {createdDepartments.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recently Created</h3>
            {createdDepartments.map((department) => (
              <div
                key={department.id}
                className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
              >
                <p className="font-medium">{department.name}</p>
                <p className="text-muted-foreground">
                  {department.code ? `${department.code} | ` : ""}
                  {department.description ?? "No description"}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Create Department Account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Generate login credentials for a department admin account.
      </p>

      <form className="mt-4 space-y-4" onSubmit={onCreateDepartmentAccount}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="department-account-name">
              Full Name
            </label>
            <input
              id="department-account-name"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="Department Admin"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="department-account-email">
              Email
            </label>
            <input
              id="department-account-email"
              type="email"
              value={accountEmail}
              onChange={(event) => setAccountEmail(event.target.value)}
              placeholder="department.admin@example.com"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="department-account-password">
            Temporary Password
          </label>
          <input
            id="department-account-password"
            type="password"
            value={accountPassword}
            onChange={(event) => setAccountPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
          />
        </div>

        <button
          type="submit"
          disabled={creatingAccount}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creatingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create Department Account
        </button>
      </form>
    </article>
  );
}
