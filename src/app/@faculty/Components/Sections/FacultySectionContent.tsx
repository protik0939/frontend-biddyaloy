"use client";

import { Loader2, Save, UserPlus2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createDepartmentAccount,
  getFacultyProfileDetails,
  updateFacultyName,
} from "@/services/Faculty/facultyManagement.service";
import PostingManagementPanel from "@/Components/PostingManagement/PostingManagementPanel";

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

  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountDepartmentFullName, setAccountDepartmentFullName] = useState("");
  const [accountDepartmentShortName, setAccountDepartmentShortName] = useState("");
  const [accountDepartmentDescription, setAccountDepartmentDescription] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  const canUpdateProfile = profileFullName.trim().length >= 2;
  const canCreateAccount = useMemo(() => {
    return (
      accountName.trim().length >= 2 &&
      accountEmail.trim().includes("@") &&
      accountPassword.trim().length >= 8 &&
      accountDepartmentFullName.trim().length >= 2
    );
  }, [
    accountDepartmentFullName,
    accountEmail,
    accountName,
    accountPassword,
  ]);

  useEffect(() => {
    if (
      section !== "profile" &&
      section !== "departments" &&
      section !== "departmentAccounts"
    ) {
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
        facultyId: profileFacultyId.trim() || undefined,
        departmentFullName: accountDepartmentFullName.trim(),
        departmentShortName: accountDepartmentShortName.trim() || undefined,
        departmentDescription: accountDepartmentDescription.trim() || undefined,
      });

      setAccountName("");
      setAccountEmail("");
      setAccountPassword("");
      setAccountDepartmentFullName("");
      setAccountDepartmentShortName("");
      setAccountDepartmentDescription("");
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
      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <h2 className="text-base font-semibold">Edit Faculty Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update faculty full name, short name, description, and optional faculty id.
        </p>

        <form className="mt-4 space-y-3" onSubmit={onUpdateProfile}>
          {loadingProfile ? (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading current profile...
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block space-y-1 text-sm" htmlFor="faculty-full-name">
              <span className="font-medium">Full Name</span>
              <input
                id="faculty-full-name"
                value={profileFullName}
                onChange={(event) => setProfileFullName(event.target.value)}
                placeholder="Faculty of Science"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              />
            </label>

            <label className="block space-y-1 text-sm" htmlFor="faculty-short-name">
              <span className="font-medium">Short Name (optional)</span>
              <input
                id="faculty-short-name"
                value={profileShortName}
                onChange={(event) => setProfileShortName(event.target.value)}
                placeholder="FOS"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm" htmlFor="faculty-description">
            <span className="font-medium">Description (optional)</span>
            <textarea
              id="faculty-description"
              value={profileDescription}
              onChange={(event) => setProfileDescription(event.target.value)}
              rows={4}
              placeholder="Brief summary of this faculty"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      </article>
    );
  }

  if (section === "departments" || section === "departmentAccounts") {
    return (
      <div className="space-y-4">

        <article className="rounded-xl border border-border/70 bg-background/70 p-4">
          <h2 className="text-base font-semibold">Create Department and Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate login credentials for a department admin account and create the department.
          </p>

          <form className="mt-4 space-y-3" onSubmit={onCreateDepartmentAccount}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1 text-sm" htmlFor="department-account-name">
                <span className="font-medium">Full Name</span>
                <input
                  id="department-account-name"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder="Department Admin"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>

              <label className="block space-y-1 text-sm" htmlFor="department-account-email">
                <span className="font-medium">Email</span>
                <input
                  id="department-account-email"
                  type="email"
                  value={accountEmail}
                  onChange={(event) => setAccountEmail(event.target.value)}
                  placeholder="department.admin@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm" htmlFor="department-account-password">
              <span className="font-medium">Temporary Password</span>
              <input
                id="department-account-password"
                type="password"
                value={accountPassword}
                onChange={(event) => setAccountPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              />
            </label>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-3">
              <p className="text-sm font-semibold">Department Details</p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block space-y-1 text-sm" htmlFor="department-account-department-name">
                  <span className="font-medium">Department Full Name</span>
                <input
                  id="department-account-department-name"
                  value={accountDepartmentFullName}
                  onChange={(event) => setAccountDepartmentFullName(event.target.value)}
                  placeholder="Department of Computer Science"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
                </label>

                <label className="block space-y-1 text-sm" htmlFor="department-account-department-short-name">
                  <span className="font-medium">Department Short Name (optional)</span>
                <input
                  id="department-account-department-short-name"
                  value={accountDepartmentShortName}
                  onChange={(event) => setAccountDepartmentShortName(event.target.value)}
                  placeholder="CSE"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
                </label>
              </div>

              <label className="block space-y-1 text-sm" htmlFor="department-account-department-description">
                <span className="font-medium">Department Description (optional)</span>
              <textarea
                id="department-account-department-description"
                value={accountDepartmentDescription}
                onChange={(event) => setAccountDepartmentDescription(event.target.value)}
                rows={3}
                placeholder="Brief department description"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              />
              </label>
            </div>

            <button
              type="submit"
              disabled={creatingAccount}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus2 className="h-4 w-4" />}
              Create Department Account
            </button>
          </form>
        </article>

      </div>
    );
  }

  if (section === "posts") {
    return (
      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <h2 className="text-base font-semibold">Posting Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create teacher job and student admission posts for this faculty.
        </p>
        <div className="mt-4">
          <PostingManagementPanel scope="FACULTY" />
        </div>
      </article>
    );
  }

  return null;
}
