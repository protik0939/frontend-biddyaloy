"use client";

import { Check, FileClock, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SearchableSelect from "@/Components/ui/SearchableSelect";

import {
  getInstitutionApplicationsForSuperAdmin,
  reviewInstitutionApplication,
  type InstitutionApplication,
  type InstitutionApplicationStatus,
} from "@/services/Admin/institutionApplication.service";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

type RejectionReasonMap = Record<string, string>;

export default function ApplicationsReviewPanel() {
  const [statusFilter, setStatusFilter] = useState<InstitutionApplicationStatus | "ALL">("ALL");
  const [applications, setApplications] = useState<InstitutionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReasonMap>({});

  const pendingCount = useMemo(
    () => applications.filter((application) => application.status === "PENDING").length,
    [applications],
  );

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInstitutionApplicationsForSuperAdmin(
        statusFilter === "ALL" ? undefined : statusFilter,
      );
      setApplications(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load applications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const handleApprove = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      await reviewInstitutionApplication(applicationId, { status: "APPROVED" });
      toast.success("Application approved");
      await loadApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Approval failed";
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    const reason = (rejectionReasons[applicationId] ?? "").trim();
    if (!reason) {
      toast.warning("Please provide a rejection reason");
      return;
    }

    setProcessingId(applicationId);
    try {
      await reviewInstitutionApplication(applicationId, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      toast.info("Application rejected");
      await loadApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rejection failed";
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Institution Application Reviews</h3>
          <p className="text-sm text-muted-foreground">
            Pending applications: <span className="font-medium text-foreground">{pendingCount}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchableSelect
            value={statusFilter}
            onChange={(nextValue) => setStatusFilter(nextValue as InstitutionApplicationStatus | "ALL")}
            options={[
              { value: "ALL", label: "All" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
            ]}
            placeholder="All"
            searchPlaceholder="Search status..."
            emptyText="No status found"
            className="min-w-40"
          />

          <button
            type="button"
            onClick={() => void loadApplications()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background/50 p-6 text-center text-sm text-muted-foreground">
          <FileClock className="mx-auto mb-2 h-5 w-5 text-primary" />
          No applications found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => {
            const isPending = application.status === "PENDING";
            const isProcessing = processingId === application.id;

            return (
              <article key={application.id} className="rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{application.institutionName}</h4>
                    <p className="text-xs text-muted-foreground">
                      Applicant: {application.applicantUser?.name ?? "Unknown"} ({application.applicantUser?.email ?? "N/A"})
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Submitted: {formatDate(application.createdAt)}</p>
                  </div>
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium">
                    {application.status}
                  </span>
                </div>

                {application.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{application.description}</p>
                ) : null}

                {!isPending && application.rejectionReason ? (
                  <p className="mt-2 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
                    Rejection reason: {application.rejectionReason}
                  </p>
                ) : null}

                {isPending ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={2}
                      value={rejectionReasons[application.id] ?? ""}
                      onChange={(event) =>
                        setRejectionReasons((prev) => ({
                          ...prev,
                          [application.id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Reason for rejection (required if rejecting)"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => void handleApprove(application.id)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => void handleReject(application.id)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
