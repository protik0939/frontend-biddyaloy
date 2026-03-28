import { toSameOriginUrl } from "@/lib/same-origin";

type VerificationPayloadBase = {
  email: string;
};

type VerifyOtpPayload = VerificationPayloadBase & {
  otp: string;
};

type VerificationResponse = {
  success?: boolean;
  message?: string;
  data?: {
    verificationRequired?: boolean;
    otpExpiresAt?: string | null;
    resendAvailableAt?: string | null;
    otpValiditySeconds?: number;
    resendCooldownSeconds?: number;
    verified?: boolean;
    role?: string;
    accountStatus?: string;
  };
};

function readMessage(body: VerificationResponse, fallback: string): string {
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }

  return fallback;
}

async function postVerification<TPayload extends object>(
  endpoint: string,
  payload: TPayload,
  fallbackErrorMessage: string,
) {
  const response = await fetch(toSameOriginUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
    cache: "no-store",
  });

  let body: VerificationResponse = {};

  try {
    body = (await response.json()) as VerificationResponse;
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw new Error(readMessage(body, fallbackErrorMessage));
  }

  return body.data;
}

export async function getVerificationStatus(payload: VerificationPayloadBase) {
  return postVerification(
    "/api/v1/auth/otp/status",
    payload,
    "Failed to load verification status",
  );
}

export async function resendVerificationOtp(payload: VerificationPayloadBase) {
  return postVerification(
    "/api/v1/auth/otp/resend",
    payload,
    "Failed to resend verification email",
  );
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  return postVerification(
    "/api/v1/auth/otp/verify",
    payload,
    "Failed to verify OTP",
  );
}
