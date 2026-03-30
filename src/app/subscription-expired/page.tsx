import Link from "next/link";

export default function SubscriptionExpiredPage() {
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
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Sign in with another account
          </Link>
          <Link
            href="/admin"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Institution Admin: Renew Subscription
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Institution admins can use the renewal action above to open the admin portal and continue subscription payment.
        </p>
      </section>
    </main>
  );
}
