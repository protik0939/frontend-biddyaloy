import { toSameOriginUrl } from "@/lib/same-origin";

type LoginPayload = {
	email: string;
	password: string;
};

export type AuthFieldErrors = Partial<Record<"firstName" | "lastName" | "email" | "role" | "password", string>>;

export type AuthApiResponse = {
	token?: string;
	accessToken?: string;
	jwt?: string;
	refreshToken?: string;
	role?: string;
	accountStatus?: string;
	verificationRequired?: boolean;
	verification?: {
		otpExpiresAt?: string;
		resendAvailableAt?: string;
		otpValiditySeconds?: number;
		resendCooldownSeconds?: number;
	};
	user?: {
		role?: string;
		accountStatus?: string;
	};
	data?: {
		token?: string;
		accessToken?: string;
		jwt?: string;
		refreshToken?: string;
		role?: string;
		accountStatus?: string;
		verificationRequired?: boolean;
		verification?: {
			otpExpiresAt?: string;
			resendAvailableAt?: string;
			otpValiditySeconds?: number;
			resendCooldownSeconds?: number;
		};
		user?: {
			role?: string;
			accountStatus?: string;
		};
	};
	message?: string | string[];
	error?: unknown;
	errors?: unknown;
};

export type AuthApiResult =
	| { ok: true; body: AuthApiResponse; setCookies: string[] }
	| { ok: false; message: string; fieldErrors?: AuthFieldErrors };

type BackendValidationError = {
	path?: unknown;
	message?: unknown;
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

function mapBackendPathToField(path: unknown): keyof AuthFieldErrors | undefined {
	const suffix = getPathSuffix(path);

	if (suffix.endsWith("email")) {
		return "email";
	}

	if (suffix.endsWith("password")) {
		return "password";
	}

	return undefined;
}

function collectFieldErrors(raw: unknown): AuthFieldErrors {
	if (!raw || typeof raw !== "object") {
		return {};
	}

	const body = raw as { errors?: unknown; issues?: unknown; error?: unknown };
	const candidates: unknown[] = [body.errors, body.issues, body.error];
	const fieldErrors: AuthFieldErrors = {};

	for (const candidate of candidates) {
		if (!Array.isArray(candidate)) {
			continue;
		}

		for (const item of candidate as BackendValidationError[]) {
			const field = mapBackendPathToField(item.path);
			const message = typeof item.message === "string" ? item.message : undefined;

			if (field && message && !fieldErrors[field]) {
				fieldErrors[field] = message;
			}
		}
	}

	return fieldErrors;
}

function extractSetCookies(response: Response): string[] {
	const headersWithSetCookie = response.headers as Headers & {
		getSetCookie?: () => string[];
	};

	if (typeof headersWithSetCookie.getSetCookie === "function") {
		return headersWithSetCookie.getSetCookie().filter(Boolean);
	}

	const rawSetCookie = response.headers.get("set-cookie");
	return rawSetCookie ? [rawSetCookie] : [];
}

export async function loginService(payload: LoginPayload): Promise<AuthApiResult> {
	if (!payload.email || !payload.password) {
		return {
			ok: false,
			message: "Email and password are required",
			fieldErrors: {
				email: payload.email ? undefined : "Email is required",
				password: payload.password ? undefined : "Password is required",
			},
		};
	}

	const endpoints = [
		toSameOriginUrl("/api/v1/auth/login"),
		toSameOriginUrl("/api/auth/login"),
		toSameOriginUrl("/auth/login"),
	];

	let lastError = "Authentication failed";

	for (const endpoint of endpoints) {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			credentials: "include",
			cache: "no-store",
		});

		let body: AuthApiResponse = {};
		try {
			body = (await response.json()) as AuthApiResponse;
		} catch {
			body = {};
		}

		if (response.ok) {
			return { ok: true, body, setCookies: extractSetCookies(response) };
		}

		const parsedMessage =
			getValidationMessage(body) ?? `Request failed with status ${response.status}`;
		const fieldErrors = collectFieldErrors(body);

		if (response.status !== 404) {
			return { ok: false, message: parsedMessage, fieldErrors };
		}

		lastError = parsedMessage;
	}

	return {
		ok: false,
		message: lastError,
	};
}
