"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getVerificationStatus,
  resendVerificationOtp,
  verifyOtp,
} from "@/services/Authentication/verification.service";

type VerifyAccountProps = {
  email: string;
  initialOtpExpiresAt?: string;
  initialResendAvailableAt?: string;
};

function formatCountdown(seconds: number): string {
  if (seconds <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function toSecondsLeft(isoDate?: string, nowMillis?: number): number {
  if (!isoDate) {
    return 0;
  }

  const endAt = new Date(isoDate).getTime();

  if (Number.isNaN(endAt)) {
    return 0;
  }

  const now = typeof nowMillis === "number" ? nowMillis : Date.now();
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}

export default function VerifyAccount({
  email,
  initialOtpExpiresAt,
  initialResendAvailableAt,
}: Readonly<VerifyAccountProps>) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | undefined>(initialOtpExpiresAt);
  const [resendAvailableAt, setResendAvailableAt] = useState<string | undefined>(
    initialResendAvailableAt,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const otpSecondsLeft = useMemo(() => {
    return toSecondsLeft(otpExpiresAt, currentTime);
  }, [otpExpiresAt, currentTime]);

  const resendSecondsLeft = useMemo(() => {
    return toSecondsLeft(resendAvailableAt, currentTime);
  }, [resendAvailableAt, currentTime]);

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  const handleRefreshStatus = async () => {
    const status = await getVerificationStatus({ email });
    setOtpExpiresAt(status?.otpExpiresAt ?? undefined);
    setResendAvailableAt(status?.resendAvailableAt ?? undefined);
  };

  const handleVerify = async () => {
    setError(null);
    setInfo(null);

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP sent to your email");
      return;
    }

    setVerifying(true);

    try {
      const result = await verifyOtp({
        email,
        otp: otp.trim(),
      });

      document.cookie = "pending_verification=0; path=/; Max-Age=0; SameSite=Lax";
      document.cookie = "pending_verification_email=; path=/; Max-Age=0; SameSite=Lax";

      if (result?.role) {
        document.cookie = `user_role=${encodeURIComponent(result.role)}; path=/; SameSite=Lax`;
      }

      globalThis.location.href = "/?toast=Account%20verified%20successfully&toastType=success";
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Failed to verify OTP");
      await handleRefreshStatus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);

    setResending(true);
    try {
      const result = await resendVerificationOtp({ email });
      setOtpExpiresAt(result?.otpExpiresAt ?? undefined);
      setResendAvailableAt(result?.resendAvailableAt ?? undefined);
      setInfo("A new OTP has been sent to your email");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Failed to resend email");
      await handleRefreshStatus();
    } finally {
      setResending(false);
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
              <h1 className="text-2xl font-semibold text-foreground">Verify your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the OTP sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                OTP validity: 2 minutes. Resend becomes available after 1 minute.
              </p>
            </div>

            <div className="space-y-5">
              <label className="block text-sm font-medium text-foreground">
                <span>One-time password</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replaceAll(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="mt-2 w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-center text-lg tracking-[0.35em] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>

              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  Code expires in:{" "}
                  <span className="ml-2 font-semibold text-foreground">{formatCountdown(otpSecondsLeft)}</span>
                </p>
                <p>
                  Resend in:{" "}
                  <span className="ml-2 font-semibold text-foreground">
                    {resendSecondsLeft > 0 ? formatCountdown(resendSecondsLeft) : "Available"}
                  </span>
                </p>
              </div>

              {error ? (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              {info ? (
                <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                  {info}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify
              </button>

              {resendSecondsLeft <= 0 ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Resend email
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
