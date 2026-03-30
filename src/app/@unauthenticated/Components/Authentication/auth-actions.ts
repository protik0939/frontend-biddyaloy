"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginService, type AuthApiResponse, type AuthFieldErrors } from "@/services/Authentication/login.service";
import { signupService } from "@/services/Authentication/signup.service";

const ROLE_SET = new Set([
  "SUPERADMIN",
  "ADMIN",
  "FACULTY",
  "DEPARTMENT",
  "TEACHER",
  "STUDENT",
  "UNAUTHENTICATED",
]);

const AUTH_COOKIE_NAMES = new Set([
  "auth_token",
  "user_role",
  "session_token",
  "better-auth.session_token",
  "better-auth.session-token",
  "better-auth.csrf_token",
  "better-auth.callback-url",
]);

const PENDING_VERIFICATION_COOKIE = "pending_verification";
const PENDING_VERIFICATION_EMAIL_COOKIE = "pending_verification_email";

function getString(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function normalizeRole(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return ROLE_SET.has(normalized) ? normalized : undefined;
}

function pickToken(data: AuthApiResponse): string | undefined {
  const candidates = [
    data.token,
    data.accessToken,
    data.jwt,
    data.data?.token,
    data.data?.accessToken,
    data.data?.jwt,
  ];

  return candidates.find((value) => typeof value === "string" && value.length > 0);
}

function pickRole(data: AuthApiResponse): string | undefined {
  return normalizeRole(
    data.role ?? data.user?.role ?? data.data?.role ?? data.data?.user?.role,
  );
}

function pickAccountStatus(data: AuthApiResponse): string | undefined {
  const candidate =
    data.user?.accountStatus ??
    data.data?.user?.accountStatus ??
    data.accountStatus ??
    (data.data as { accountStatus?: string } | undefined)?.accountStatus;

  return typeof candidate === "string" ? candidate.toUpperCase() : undefined;
}

function pickVerificationRequired(data: AuthApiResponse): boolean {
  const direct = (data as { verificationRequired?: unknown }).verificationRequired;
  if (typeof direct === "boolean") {
    return direct;
  }

  const nested = (data.data as { verificationRequired?: unknown } | undefined)
    ?.verificationRequired;
  return typeof nested === "boolean" ? nested : false;
}

type VerificationMeta = {
  otpExpiresAt?: string;
  resendAvailableAt?: string;
};

function pickVerificationMeta(data: AuthApiResponse): VerificationMeta {
  const direct = (data as { verification?: VerificationMeta }).verification;
  if (direct) {
    return direct;
  }

  const nested = (data.data as { verification?: VerificationMeta } | undefined)
    ?.verification;
  return nested ?? {};
}

function buildVerifyAccountRedirectUrl(email: string, verificationMeta?: VerificationMeta) {
  const params = new URLSearchParams();
  params.set("email", email);

  if (verificationMeta?.otpExpiresAt) {
    params.set("otpExpiresAt", verificationMeta.otpExpiresAt);
  }

  if (verificationMeta?.resendAvailableAt) {
    params.set("resendAvailableAt", verificationMeta.resendAvailableAt);
  }

  return `/verify-account?${params.toString()}`;
}

type ParsedCookieOptions = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

function applyCookieAttribute(options: ParsedCookieOptions, key: string, attributeValue: string) {
  switch (key) {
    case "path":
      if (attributeValue) {
        options.path = attributeValue;
      }
      return;
    case "domain":
      if (attributeValue) {
        options.domain = attributeValue;
      }
      return;
    case "max-age": {
      const maxAge = Number(attributeValue);
      if (!Number.isNaN(maxAge)) {
        options.maxAge = maxAge;
      }
      return;
    }
    case "expires": {
      const expires = new Date(attributeValue);
      if (!Number.isNaN(expires.getTime())) {
        options.expires = expires;
      }
      return;
    }
    case "httponly":
      options.httpOnly = true;
      return;
    case "secure":
      options.secure = true;
      return;
    case "samesite": {
      const normalizedSameSite = attributeValue.toLowerCase();
      if (normalizedSameSite === "lax" || normalizedSameSite === "strict" || normalizedSameSite === "none") {
        options.sameSite = normalizedSameSite;
      }
      return;
    }
    default:
      return;
  }
}

function parseSetCookieMeta(attributes: string[]): ParsedCookieOptions {
  const options: ParsedCookieOptions = {};

  for (const attribute of attributes) {
    const [rawKey, ...rawValueParts] = attribute.split("=");
    const key = rawKey.trim().toLowerCase();
    const attributeValue = rawValueParts.join("=").trim();

    applyCookieAttribute(options, key, attributeValue);
  }

  return options;
}

function parseSetCookie(rawCookie: string) {
  const segments = rawCookie.split(";").map((segment) => segment.trim()).filter(Boolean);
  const [nameValue, ...attributes] = segments;

  if (!nameValue) {
    return null;
  }

  const separatorIndex = nameValue.indexOf("=");
  if (separatorIndex < 1) {
    return null;
  }

  const name = nameValue.slice(0, separatorIndex).trim();
  const value = nameValue.slice(separatorIndex + 1);

  return {
    name,
    value,
    options: parseSetCookieMeta(attributes),
  };
}

function applySetCookieString(cookieStore: Awaited<ReturnType<typeof cookies>>, rawCookie: string) {
  const parsedCookie = parseSetCookie(rawCookie);
  if (!parsedCookie) {
    return;
  }
  cookieStore.set(parsedCookie.name, parsedCookie.value, parsedCookie.options);
}

function buildSignupErrorRedirectUrlWithValues(
  message: string,
  values: { firstName: string; lastName: string; email: string; role: string },
  fieldErrors?: AuthFieldErrors,
) {
  const params = new URLSearchParams();
  params.set("error", message);

  if (values.firstName) {
    params.set("firstName", values.firstName);
  }
  if (values.lastName) {
    params.set("lastName", values.lastName);
  }
  if (values.email) {
    params.set("email", values.email);
  }
  if (values.role) {
    params.set("role", values.role);
  }

  if (fieldErrors?.firstName) {
    params.set("firstNameError", fieldErrors.firstName);
  }
  if (fieldErrors?.lastName) {
    params.set("lastNameError", fieldErrors.lastName);
  }
  if (fieldErrors?.email) {
    params.set("emailError", fieldErrors.email);
  }
  if (fieldErrors?.role) {
    params.set("roleError", fieldErrors.role);
  }
  if (fieldErrors?.password) {
    params.set("passwordError", fieldErrors.password);
  }

  return `/signup?${params.toString()}`;
}

function buildLoginErrorRedirectUrl(
  message: string,
  values: { email: string },
  fieldErrors?: AuthFieldErrors,
) {
  const params = new URLSearchParams();
  params.set("error", message);

  if (values.email) {
    params.set("email", values.email);
  }

  if (fieldErrors?.email) {
    params.set("emailError", fieldErrors.email);
  }

  if (fieldErrors?.password) {
    params.set("passwordError", fieldErrors.password);
  }

  return `/login?${params.toString()}`;
}

async function persistSession(data: AuthApiResponse, setCookies: string[], pendingEmail?: string) {
  const cookieStore = await cookies();
  const token = pickToken(data);
  const role = pickRole(data);
  const accountStatus = pickAccountStatus(data);
  const verificationRequired = pickVerificationRequired(data) || accountStatus === "PENDING";

  for (const rawCookie of setCookies) {
    applySetCookieString(cookieStore, rawCookie);
  }

  if (token) {
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  if (role && !verificationRequired) {
    cookieStore.set("user_role", role, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } else {
    cookieStore.set("user_role", "UNAUTHENTICATED", {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  if (verificationRequired) {
    cookieStore.set(PENDING_VERIFICATION_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    if (pendingEmail) {
      cookieStore.set(PENDING_VERIFICATION_EMAIL_COOKIE, pendingEmail, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }
  } else {
    cookieStore.delete(PENDING_VERIFICATION_COOKIE);
    cookieStore.delete(PENDING_VERIFICATION_EMAIL_COOKIE);
  }
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email").trim();
  const password = getString(formData, "password");

  if (!email || !password) {
    redirect(
      buildLoginErrorRedirectUrl(
        "Email and password are required",
        { email },
        {
          email: email ? undefined : "Email is required",
          password: password ? undefined : "Password is required",
        },
      ),
    );
  }

  const result = await loginService({ email, password });
  if (!result.ok) {
    redirect(buildLoginErrorRedirectUrl(result.message, { email }, result.fieldErrors));
  }

  await persistSession(result.body, result.setCookies, email);

  const verificationRequired = pickVerificationRequired(result.body) || pickAccountStatus(result.body) === "PENDING";
  if (verificationRequired) {
    redirect(buildVerifyAccountRedirectUrl(email, pickVerificationMeta(result.body)));
  }

  redirect("/?toast=Login%20successful&toastType=success");
}

export async function signupAction(formData: FormData) {
  type SignUpRole = "ADMIN" | "TEACHER" | "STUDENT";

  const firstName = getString(formData, "firstName").trim();
  const lastName = getString(formData, "lastName").trim();
  const email = getString(formData, "email").trim();
  const role = getString(formData, "role").trim().toUpperCase();
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");
  const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;
  const allowedSignupRoles = new Set<SignUpRole>(["ADMIN", "TEACHER", "STUDENT"]);
  const isSignUpRole = (value: string): value is SignUpRole => {
    return allowedSignupRoles.has(value as SignUpRole);
  };

  if (!firstName || !lastName || !email || !password || !role) {
    redirect(
      buildSignupErrorRedirectUrlWithValues(
        "First name, last name, email, role and password are required",
        { firstName, lastName, email, role },
      ),
    );
  }

  if (password !== confirmPassword) {
    redirect(
      buildSignupErrorRedirectUrlWithValues(
        "Password and confirm password do not match",
        { firstName, lastName, email, role },
        { password: "Password and confirm password do not match" },
      ),
    );
  }

  if (!isSignUpRole(role)) {
    redirect(
      buildSignupErrorRedirectUrlWithValues(
        "Selected role is invalid",
        { firstName, lastName, email, role },
      ),
    );
  }

  const selectedRole: SignUpRole = role;

  const result = await signupService({
    name,
    firstName,
    lastName,
    role: selectedRole,
    email,
    password,
  });

  if (!result.ok) {
    redirect(
      buildSignupErrorRedirectUrlWithValues(
        result.message,
        { firstName, lastName, email, role },
        result.fieldErrors,
      ),
    );
  }

  await persistSession(result.body, result.setCookies, email);

  const verificationRequired = pickVerificationRequired(result.body) || pickAccountStatus(result.body) === "PENDING";
  if (verificationRequired) {
    redirect(buildVerifyAccountRedirectUrl(email, pickVerificationMeta(result.body)));
  }

  redirect("/?toast=Signup%20successful&toastType=success");
}

function getBackendBaseUrl() {
  return process.env.BACKEND_PUBLIC_URL;
}

function shouldDeleteAuthCookie(name: string) {
  if (AUTH_COOKIE_NAMES.has(name)) {
    return true;
  }

  return name.toLowerCase().includes("better-auth") || name.toLowerCase().includes("auth");
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  const existingCookies = cookieStore.getAll();

  for (const cookie of existingCookies) {
    if (shouldDeleteAuthCookie(cookie.name)) {
      cookieStore.delete(cookie.name);
    }
  }

  cookieStore.delete("auth_token");
  cookieStore.delete("user_role");
  cookieStore.delete(PENDING_VERIFICATION_COOKIE);
  cookieStore.delete(PENDING_VERIFICATION_EMAIL_COOKIE);
}

async function tryBackendSignOut() {
  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return;
  }

  const normalizedBase = backendBase.endsWith("/") ? backendBase.slice(0, -1) : backendBase;
  const endpoint = `${normalizedBase}/api/auth/sign-out`;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((item) => `${item.name}=${item.value}`).join("; ");

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    // Ignore backend sign-out failures because local cookie cleanup still logs out the user.
  }
}

export async function logoutAction() {
  await tryBackendSignOut();
  await clearAuthCookies();
  redirect("/login?toast=Logout%20successful&toastType=success");
}

async function requestLeaveInstitution(reason?: string) {
  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return;
  }

  const normalizedBase = backendBase.endsWith("/") ? backendBase.slice(0, -1) : backendBase;
  const endpoint = `${normalizedBase}/api/v1/auth/leave-institution`;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((item) => `${item.name}=${item.value}`).join("; ");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({ reason }),
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Failed to submit leave request");
  }
}

export async function leaveInstitutionAndLogoutAction(formData: FormData) {
  const reason = getString(formData, "reason").trim();

  try {
    await requestLeaveInstitution(reason || undefined);
    await tryBackendSignOut();
    await clearAuthCookies();
    redirect("/login?toast=Leave%20request%20submitted%20and%20logged%20out&toastType=success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit leave request";
    redirect(`/subscription-expired?toast=${encodeURIComponent(message)}&toastType=error`);
  }
}