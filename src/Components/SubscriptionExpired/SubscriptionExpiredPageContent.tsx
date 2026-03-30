import Link from "next/link";
import {
  initiateInstitutionSubscriptionRenewalAction,
  leaveInstitutionAndLogoutAction,
  logoutAction,
} from "@/app/@unauthenticated/Components/Authentication/auth-actions";

type SubscriptionExpiredPageContentProps = {
  canRenew: boolean;
  canLeaveInstitution: boolean;
};

export default function SubscriptionExpiredPageContent({
  canRenew,
  canLeaveInstitution,
}: Readonly<SubscriptionExpiredPageContentProps>) {
  return (
    <main className="fixed top-0 w-full flex min-h-screen items-center justify-center bg-linear-to-br from-rose-50 via-background to-amber-50 px-4 py-16 text-foreground dark:from-rose-950/20 dark:to-amber-950/20">
      <section className="w-full max-w-2xl rounded-2xl border border-border/70 bg-background/95 p-6 shadow-lg sm:p-8">
        <p className="inline-flex rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">
          Subscription Expired
        </p>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">Your institution subscription has expired</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Access to the institution portal is currently locked. Please contact your institution admin to renew the subscription plan and restore access.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Back to Home
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Sign in with another account
            </button>
          </form>
          {canLeaveInstitution ? (
            <form action={leaveInstitutionAndLogoutAction}>
              <input type="hidden" name="reason" value="Requested leave from subscription expired screen" />
              <button
                type="submit"
                className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
              >
                Leave Institution
              </button>
            </form>
          ) : null}
        </div>

        {canRenew ? (
          <form action={initiateInstitutionSubscriptionRenewalAction} className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <p className="text-sm font-semibold text-emerald-700">Renew institution subscription</p>
            <p className="mt-1 text-xs text-emerald-700/80">
              Select a plan and continue to SSLCommerz to complete renewal.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                name="plan"
                defaultValue="YEARLY"
                className="h-10 rounded-lg border border-emerald-300 bg-white px-3 text-sm text-slate-900 dark:text-slate-900"
              >
                <option value="MONTHLY" className="bg-white text-slate-900">Monthly - BDT 500</option>
                <option value="HALF_YEARLY" className="bg-white text-slate-900">Half Yearly - BDT 2,800</option>
                <option value="YEARLY" className="bg-white text-slate-900">Yearly - BDT 5,600</option>
              </select>
              <button
                type="submit"
                className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white"
              >
                Institution Admin: Renew Subscription
              </button>
            </div>
          </form>
        ) : null}

        {canRenew ? (
          <p className="mt-3 text-xs text-muted-foreground">
            After successful payment, access is restored automatically for your institution.
          </p>
        ) : null}
        {canLeaveInstitution ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Students, teachers, and admins can submit a leave request from here and sign out safely.
          </p>
        ) : null}
      </section>
    </main>
  );
}
