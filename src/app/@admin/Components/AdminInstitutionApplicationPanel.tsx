"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import type {
  CreateInstitutionSubAdminPayload,
  InstitutionFacultyOption,
} from "@/services/Admin/adminManagement.service";
import {
  createInstitutionSubAdminAccount,
  listInstitutionFaculties,
} from "@/services/Admin/adminManagement.service";
import {
  createInstitutionApplication,
  getAdminInstitutionFeePayments,
  getInstitutionSubscriptionPricing,
  getMyInstitutionApplications,
  initiateInstitutionSubscriptionPayment,
  type InstitutionStudentPaymentReport,
  type InstitutionSubscriptionPlan,
  type InstitutionSubscriptionPricingItem,
  type CreateInstitutionApplicationPayload,
  type InstitutionApplication,
} from "@/services/Admin/institutionApplication.service";
import AdminDashboard from "./AdminInstitutionApplicationPanel/AdminDashboard";
import ApplicationHistory from "./AdminInstitutionApplicationPanel/ApplicationHistory";
import ApplicationStatusBanners from "./AdminInstitutionApplicationPanel/ApplicationStatusBanners";
import InstitutionApplicationForm from "./AdminInstitutionApplicationPanel/InstitutionApplicationForm";
import { emptyForm } from "./AdminInstitutionApplicationPanel/utils";
import ThemeToggle from "@/Components/ThemeToggle";
import LogoutButton from "@/Components/LogoutButton";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

async function createSubAdminAccountWithToast(payload: CreateInstitutionSubAdminPayload) {
  try {
    const created = await createInstitutionSubAdminAccount(payload);
    const accountKind = payload.accountType === "FACULTY" ? "Faculty" : "Department";
    const details: string[] = [];

    if (created.faculty?.fullName) {
      details.push(`Faculty: ${created.faculty.fullName}`);
    }

    if (created.department?.fullName) {
      details.push(`Department: ${created.department.fullName}`);
    }

    const detailsText = details.length > 0 ? ` (${details.join(" | ")})` : "";
    toast.success(`${accountKind} account created for ${created.email}${detailsText}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create faculty or department account";
    toast.error(message);
    throw error;
  }
}

async function initiateSubscriptionPaymentWithRedirect(
  applicationId: string,
  plan: InstitutionSubscriptionPlan,
) {
  const result = await initiateInstitutionSubscriptionPayment(applicationId, { plan });
  globalThis.location.assign(result.paymentUrl);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function AdminInstitutionApplicationPanel() {
  const [applications, setApplications] = useState<InstitutionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateInstitutionApplicationPayload>(emptyForm());
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);
  const [faculties, setFaculties] = useState<InstitutionFacultyOption[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [pricing, setPricing] = useState<InstitutionSubscriptionPricingItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InstitutionSubscriptionPlan>("MONTHLY");
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [institutionPayments, setInstitutionPayments] = useState<InstitutionStudentPaymentReport | null>(null);
  const [loadingInstitutionPayments, setLoadingInstitutionPayments] = useState(false);
  const debouncedFacultySearchTerm = useDebouncedValue(facultySearchTerm, 1000);

  const latest = applications[0];
  const isApproved = latest?.status === "APPROVED";
  const approvedInstitutionType = latest?.institutionType;
  const latestPaymentStatus = latest?.subscriptionPaymentStatus ?? "PENDING";
  const needsSubscriptionPayment =
    Boolean(latest) && latest?.status === "PENDING" && latestPaymentStatus !== "PAID";

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
    let cancelled = false;

    const loadPricing = async () => {
      try {
        const items = await getInstitutionSubscriptionPricing();
        if (!cancelled) {
          setPricing(items);
          if (items.length > 0) {
            setSelectedPlan(items[0].plan);
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load subscription pricing";
          toast.error(message);
        }
      }
    };

    void loadPricing();

    return () => {
      cancelled = true;
    };
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
    await createSubAdminAccountWithToast(payload);
  };

  const handleInitiateSubscriptionPayment = async () => {
    if (!latest?.id) {
      toast.warning("No pending application found for payment");
      return;
    }

    setInitiatingPayment(true);
    try {
      await initiateSubscriptionPaymentWithRedirect(latest.id, selectedPlan);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to initialize subscription payment";
      toast.error(message);
    } finally {
      setInitiatingPayment(false);
    }
  };

  useEffect(() => {
    if (!isApproved) {
      setInstitutionPayments(null);
      return;
    }

    let cancelled = false;

    const loadInstitutionPayments = async () => {
      setLoadingInstitutionPayments(true);
      try {
        const report = await getAdminInstitutionFeePayments();
        if (!cancelled) {
          setInstitutionPayments(report);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load student payment report";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingInstitutionPayments(false);
        }
      }
    };

    void loadInstitutionPayments();

    return () => {
      cancelled = true;
    };
  }, [isApproved]);

  useEffect(() => {
    if (!isApproved) {
      setFaculties([]);
      return;
    }

    let cancelled = false;

    const loadFaculties = async () => {
      setFacultiesLoading(true);
      try {
        const items = await listInstitutionFaculties(debouncedFacultySearchTerm);
        if (!cancelled) {
          setFaculties(items);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to fetch faculties";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setFacultiesLoading(false);
        }
      }
    };

    void loadFaculties();

    return () => {
      cancelled = true;
    };
  }, [debouncedFacultySearchTerm, isApproved]);

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

  let institutionPaymentsContent: ReactNode;
  if (loadingInstitutionPayments) {
    institutionPaymentsContent = (
      <p className="mt-3 text-sm text-muted-foreground">Loading payment report...</p>
    );
  } else if (institutionPayments && institutionPayments.payments.length > 0) {
    institutionPaymentsContent = (
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-2 py-2 font-medium">Student</th>
              <th className="px-2 py-2 font-medium">Student ID</th>
              <th className="px-2 py-2 font-medium">Semester</th>
              <th className="px-2 py-2 font-medium">Mode</th>
              <th className="px-2 py-2 font-medium">Amount</th>
              <th className="px-2 py-2 font-medium">Paid At</th>
            </tr>
          </thead>
          <tbody>
            {institutionPayments.payments.slice(0, 30).map((item) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="px-2 py-2">
                  <p className="font-medium">{item.studentName}</p>
                  <p className="text-xs text-muted-foreground">{item.studentEmail ?? "N/A"}</p>
                </td>
                <td className="px-2 py-2">{item.studentsId ?? "N/A"}</td>
                <td className="px-2 py-2">{item.semesterName}</td>
                <td className="px-2 py-2">{item.paymentMode}</td>
                <td className="px-2 py-2 font-semibold">
                  {item.amount} {item.currency}
                </td>
                <td className="px-2 py-2">{item.paidAt ? new Date(item.paidAt).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else {
    institutionPaymentsContent = (
      <p className="mt-3 text-sm text-muted-foreground">No student fee payments found yet.</p>
    );
  }

  return (
    <section className="relative space-y-5 overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm sm:p-6">
      <header>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Admin Workflow</p>
            <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
              {isApproved ? "Institution Dashboard" : "Institution Application"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isApproved
                ? "Manage institution operations from the dashboard below."
                : "Submit your institution request for superadmin review. Status updates are shown below."}
            </p>
          </div>
          <div className="flex space-x-2">
            <ThemeToggle />
            <LogoutButton />
          </div>

        </div>

      </header>

      <ApplicationStatusBanners
        latest={latest}
        showApprovedBanner={showApprovedBanner}
        onDismissApprovedBanner={dismissApprovedBanner}
      />

      {needsSubscriptionPayment && latest ? (
        <article className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <h2 className="text-base font-semibold">Complete subscription payment to continue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your application is submitted. Choose a subscription period and pay now so superadmin can approve your institution.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {pricing.map((item) => {
              const isSelected = item.plan === selectedPlan;
              return (
                <button
                  key={item.plan}
                  type="button"
                  onClick={() => setSelectedPlan(item.plan)}
                  className={`rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground line-through">
                    {item.originalAmount} Tk
                  </p>
                  <p className="text-lg font-bold text-primary">{item.amount} Tk</p>
                  <p className="text-xs text-muted-foreground">{item.support}</p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void handleInitiateSubscriptionPayment()}
            disabled={initiatingPayment || pricing.length === 0}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {initiatingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {initiatingPayment ? "Redirecting to payment..." : "Pay Now"}
          </button>
        </article>
      ) : null}

      {isApproved && latest && (
        <AdminDashboard
          latest={latest}
          approvedInstitutionType={approvedInstitutionType}
          onCreateSubAdmin={handleCreateSubAdminAccount}
          faculties={faculties}
          facultiesLoading={facultiesLoading}
          facultySearchTerm={facultySearchTerm}
          onFacultySearchChange={setFacultySearchTerm}
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

      {isApproved ? (
        <section className="rounded-xl border border-border/70 bg-background/70 p-4">
          <h2 className="text-base font-semibold">Student fee payments to your institution</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Institution-wise payment transactions made by students.
          </p>
          {institutionPaymentsContent}
        </section>
      ) : null}
    </section>
  );
}
