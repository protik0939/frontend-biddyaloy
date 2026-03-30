"use client";

import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/services/Authentication/password.service";

type ForgotPasswordProps = {
  initialError?: string;
};

export default function ForgotPassword({ initialError }: Readonly<ForgotPasswordProps>) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const onSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    setSubmitting(true);
    try {
      const responseMessage = await requestPasswordReset(email.trim());
      setMessage(responseMessage);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to request password reset");
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
              <h1 className="text-2xl font-semibold text-foreground">Forgot password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your account email and we will send a secure password reset link.
              </p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <label className="block text-sm font-medium text-foreground">
                <span>Email</span>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@biddyaloy.edu"
                    className="w-full rounded-xl border border-border/70 bg-background px-10 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </label>

              {error ? (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              {message ? (
                <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Send reset link
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered your password?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                Back to sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
