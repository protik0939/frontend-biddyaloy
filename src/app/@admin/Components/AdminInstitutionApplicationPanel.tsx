"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { CreateInstitutionSubAdminPayload } from "@/services/Admin/adminManagement.service";
import { createInstitutionSubAdminAccount } from "@/services/Admin/adminManagement.service";
import {
  createInstitutionApplication,
  getMyInstitutionApplications,
  type CreateInstitutionApplicationPayload,
  type InstitutionApplication,
} from "@/services/Admin/institutionApplication.service";
import AdminDashboard from "./AdminInstitutionApplicationPanel/AdminDashboard";
import ApplicationHistory from "./AdminInstitutionApplicationPanel/ApplicationHistory";
import ApplicationStatusBanners from "./AdminInstitutionApplicationPanel/ApplicationStatusBanners";
import InstitutionApplicationForm from "./AdminInstitutionApplicationPanel/InstitutionApplicationForm";
import { emptyForm } from "./AdminInstitutionApplicationPanel/utils";

export default function AdminInstitutionApplicationPanel() {
  const [applications, setApplications] = useState<InstitutionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateInstitutionApplicationPayload>(emptyForm());
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);

  const latest = applications[0];
  const isApproved = latest?.status === "APPROVED";
  const approvedInstitutionType = latest?.institutionType;

  const canSubmit = useMemo(() => {
    return (
      form.institutionName.trim().length >= 2 &&
      (!form.shortName || form.shortName.trim().length >= 2)
    );
  }, [form]);

  const loadMyApplications = async () => {
    setLoading(true);
    try {
      const result = await getMyInstitutionApplications();
      setApplications(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch your applications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMyApplications();
  }, []);

  useEffect(() => {
    if (!isApproved || !latest?.id) {
      setShowApprovedBanner(true);
      return;
    }

    const storageKey = `admin-approved-banner-dismissed:${latest.id}`;
    try {
      const isDismissed = globalThis.localStorage.getItem(storageKey) === "1";
      setShowApprovedBanner(!isDismissed);
    } catch {
      setShowApprovedBanner(true);
    }
  }, [isApproved, latest?.id]);

  const dismissApprovedBanner = () => {
    if (!latest?.id) {
      setShowApprovedBanner(false);
      return;
    }

    const storageKey = `admin-approved-banner-dismissed:${latest.id}`;
    try {
      globalThis.localStorage.setItem(storageKey, "1");
    } catch {
      // no-op if storage is blocked
    }
    setShowApprovedBanner(false);
  };

  const handleApply = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.warning("Please fill in institution name and a valid short name");
      return;
    }

    setSubmitting(true);
    try {
      await createInstitutionApplication({
        institutionName: form.institutionName.trim(),
        shortName: form.shortName?.trim() || undefined,
        description: form.description?.trim() || undefined,
        institutionType: form.institutionType,
        institutionLogo: form.institutionLogo?.trim() || undefined,
      });
      toast.success("Application submitted successfully");
      setForm(emptyForm());
      await loadMyApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit application";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubAdminAccount = async (payload: CreateInstitutionSubAdminPayload) => {
    try {
      const created = await createInstitutionSubAdminAccount(payload);
      const accountKind = payload.accountType === "FACULTY" ? "Faculty" : "Department";
      toast.success(`${accountKind} account created for ${created.email}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create faculty or department account";
      toast.error(message);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-6 right-2 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm rounded-2xl border border-border/70 bg-background/70 p-6 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-base font-semibold">Preparing your admin workspace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Fetching institution application status...
          </p>

          <div className="mt-4 space-y-2">
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-2 w-2/3 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative space-y-5 overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm sm:p-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Admin Workflow</p>
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">Institution Application</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit your institution request for superadmin review. Status updates are shown below.
        </p>
      </header>

      <ApplicationStatusBanners
        latest={latest}
        showApprovedBanner={showApprovedBanner}
        onDismissApprovedBanner={dismissApprovedBanner}
      />

      {isApproved && latest && (
        <AdminDashboard
          latest={latest}
          approvedInstitutionType={approvedInstitutionType}
          onCreateSubAdmin={handleCreateSubAdminAccount}
        />
      )}

      {(!latest || latest.status === "REJECTED") && (
        <InstitutionApplicationForm
          form={form}
          canSubmit={canSubmit}
          submitting={submitting}
          mode={latest?.status === "REJECTED" ? "reapply" : "create"}
          onChange={setForm}
          onSubmit={handleApply}
        />
      )}

      <ApplicationHistory applications={applications} />
    </section>
  );
}
