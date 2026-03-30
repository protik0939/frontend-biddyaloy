"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/services/Authentication/password.service";

type ResetPasswordProps = {
  token: string;
};

export default function ResetPassword({ token }: Readonly<ResetPasswordProps>) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      await resetPassword(token, newPassword, confirmNewPassword);
      router.push("/login?toast=Password%20reset%20successful&toastType=success");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_48%),radial-gradient(circle_at_bottom,rgba(31,111,139,0.2),transparent_50%)]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
        <section className="relative w-full max-w-xl">
          <div className="absolute -top-6 right-6 h-24 w-24 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-primary/30 blur-3xl" />
          <div className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-xl backdrop-blur">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground">Reset password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Set a new password for your Biddyaloy account.
              </p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <label className="block text-sm font-medium text-foreground">
                <span>New password</span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                <span>Confirm new password</span>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>

              {error ? (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Update password
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Back to{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
