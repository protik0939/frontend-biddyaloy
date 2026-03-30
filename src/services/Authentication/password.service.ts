import { toSameOriginUrl } from "@/lib/same-origin";

type PasswordApiIssue = {
  path?: unknown;
  message?: unknown;
};

type PasswordApiBody = {
  success?: boolean;
  message?: string | string[];
  data?: unknown;
  errors?: unknown;
  error?: unknown;
  issues?: unknown;
};

export type ChangePasswordFieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

function getValidationMessage(raw: unknown): string | undefined {
  if (!raw) {
    return undefined;
  }

  if (typeof raw === "string") {
    return raw;
  }

  if (Array.isArray(raw)) {
    const messages = raw
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }

        if (entry && typeof entry === "object") {
          const maybeMessage = (entry as { message?: unknown }).message;
          if (typeof maybeMessage === "string") {
            return maybeMessage;
          }
        }

        return "";
      })
      .filter(Boolean);

    return messages.length ? messages.join(", ") : undefined;
  }

  if (typeof raw === "object") {
    const maybeRecord = raw as {
      message?: unknown;
      errors?: unknown;
      issues?: unknown;
      error?: unknown;
    };

    return (
      getValidationMessage(maybeRecord.message) ??
      getValidationMessage(maybeRecord.errors) ??
      getValidationMessage(maybeRecord.issues) ??
      getValidationMessage(maybeRecord.error)
    );
  }

  return undefined;
}

function getPathSuffix(path: unknown): string {
  if (typeof path === "string") {
    return path;
  }

  if (Array.isArray(path)) {
    return path.map(String).join(".");
  }

  return "";
}

function mapBackendPathToField(path: unknown): keyof ChangePasswordFieldErrors | undefined {
  const suffix = getPathSuffix(path);

  if (suffix.endsWith("currentPassword")) {
    return "currentPassword";
  }

  if (suffix.endsWith("newPassword")) {
    return "newPassword";
  }

  if (suffix.endsWith("confirmNewPassword")) {
    return "confirmNewPassword";
  }

  return undefined;
}

function collectFieldErrors(raw: unknown): ChangePasswordFieldErrors {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const body = raw as { errors?: unknown; issues?: unknown; error?: unknown };
  const candidates: unknown[] = [body.errors, body.issues, body.error];
  const fieldErrors: ChangePasswordFieldErrors = {};

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    for (const item of candidate as PasswordApiIssue[]) {
      const field = mapBackendPathToField(item.path);
      const message = typeof item.message === "string" ? item.message : undefined;

      if (field && message && !fieldErrors[field]) {
        fieldErrors[field] = message;
      }
    }
  }

  return fieldErrors;
}

async function postPasswordEndpoint<TPayload extends object>(
  endpoint: string,
  payload: TPayload,
  fallbackError: string,
) {
  const response = await fetch(toSameOriginUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  let body: PasswordApiBody = {};
  try {
    body = (await response.json()) as PasswordApiBody;
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw new Error(getValidationMessage(body) ?? fallbackError);
  }

  return body;
}

export async function requestPasswordReset(email: string): Promise<string> {
  const body = await postPasswordEndpoint(
    "/api/v1/auth/password/forgot",
    { email },
    "Failed to request password reset",
  );

  return getValidationMessage(body) ?? "If this email exists, a password reset link has been sent.";
}

export async function resetPassword(token: string, newPassword: string, confirmNewPassword: string) {
  await postPasswordEndpoint(
    "/api/v1/auth/password/reset",
    { token, newPassword, confirmNewPassword },
    "Failed to reset password",
  );
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
): Promise<{ fieldErrors?: ChangePasswordFieldErrors }> {
  const response = await fetch(toSameOriginUrl("/api/v1/auth/password/change"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  });

  let body: PasswordApiBody = {};
  try {
    body = (await response.json()) as PasswordApiBody;
  } catch {
    body = {};
  }

  if (!response.ok) {
    const fieldErrors = collectFieldErrors(body);
    const message = getValidationMessage(body) ?? "Failed to change password";
    const error = new Error(message) as Error & { fieldErrors?: ChangePasswordFieldErrors };
    error.fieldErrors = fieldErrors;
    throw error;
  }

  return {
    fieldErrors: undefined,
  };
}
