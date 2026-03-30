import Link from "next/link";
import { cookies } from "next/headers";
import {
  leaveInstitutionAndLogoutAction,
  logoutAction,
} from "@/app/@unauthenticated/Components/Authentication/auth-actions";

export default async function SubscriptionExpiredPage() {
  const cookieStore = await cookies();
  const role = (cookieStore.get("user_role")?.value ?? "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const canLeaveInstitution = role === "ADMIN" || role === "TEACHER";

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
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Institution Admin: Renew Subscription
            </Link>
          ) : null}
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
        {isAdmin ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Institution admins can use the renewal action above to open the admin portal and continue subscription payment.
          </p>
        ) : null}
        {canLeaveInstitution ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Teachers and admins can submit a leave request from here and sign out safely.
          </p>
        ) : null}
      </section>
    </main>
  );
}
