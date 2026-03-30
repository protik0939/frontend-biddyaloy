import { CheckCircle2, Clock3, X, XCircle } from "lucide-react";

import type { InstitutionApplication } from "@/services/Admin/institutionApplication.service";
import { formatDateDDMMYYYY, formatInstitutionType } from "./utils";

type Props = {
  latest?: InstitutionApplication;
  showApprovedBanner: boolean;
  onDismissApprovedBanner: () => void;
};

export default function ApplicationStatusBanners({
  latest,
  showApprovedBanner,
  onDismissApprovedBanner,
}: Readonly<Props>) {
  const isApproved = latest?.status === "APPROVED";

  return (
    <>
      {latest?.status === "PENDING" && (
        <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <Clock3 className="h-4 w-4" />
            <p className="text-sm font-semibold">Your application is under review</p>
          </div>
          <p className="text-sm text-amber-900/90 dark:text-amber-200/90">
            Institution: {latest.institutionName} ({formatInstitutionType(latest.institutionType)})
          </p>
          <p className="mt-1 text-xs font-medium text-amber-900/90 dark:text-amber-200/90">
            Subscription payment: {latest.subscriptionPaymentStatus === "PAID" ? "PAID" : "PENDING"}
          </p>
          <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-100/80">
            Submitted on {formatDateDDMMYYYY(latest.createdAt)}
          </p>
        </article>
      )}

      {isApproved && showApprovedBanner && (
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-semibold">Application approved</p>
            </div>
            <button
              type="button"
              onClick={onDismissApprovedBanner}
              aria-label="Dismiss approved application banner"
              className="inline-flex cursor-pointer rounded-md border border-emerald-500/30 bg-background/60 p-1 text-emerald-800 transition hover:bg-background dark:text-emerald-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-emerald-900/90 dark:text-emerald-200/90">
            Your institution has been created and linked to your admin profile.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-background/60 p-3">
              <p className="text-xs text-muted-foreground">Institution</p>
              <p className="font-semibold">{latest?.institutionName}</p>
            </div>
            <div className="rounded-lg bg-background/60 p-3">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-semibold">{formatInstitutionType(latest?.institutionType ?? "SCHOOL")}</p>
            </div>
          </div>
        </article>
      )}

      {latest?.status === "REJECTED" && (
        <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <XCircle className="h-4 w-4" />
            <p className="text-sm font-semibold">Latest application was rejected</p>
          </div>
          <p className="text-sm text-rose-900/90 dark:text-rose-200/90">
            Reason: {latest.rejectionReason ?? "No reason provided"}
          </p>
          <p className="mt-1 text-xs text-rose-900/80 dark:text-rose-100/80">
            You can revise details and reapply below.
          </p>
        </article>
      )}
    </>
  );
}
