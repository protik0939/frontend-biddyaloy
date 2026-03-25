import type { AuthApiResponse, AuthApiResult, AuthFieldErrors } from "./login.service";

type SignUpPayload = {
	name: string;
	firstName?: string;
	lastName?: string;
	role: "ADMIN" | "TEACHER" | "STUDENT";
	email: string;
	password: string;
};

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

function getBackendBaseUrl() {
	return process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
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

function buildSignUpPayloadForEndpoint(payload: SignUpPayload, endpoint: string) {
	if (endpoint.endsWith("/api/auth/sign-up/email")) {
		return {
			name: payload.name,
			role: payload.role,
			email: payload.email,
			password: payload.password,
		};
	}

	return {
		name: payload.name,
		firstName: payload.firstName,
		lastName: payload.lastName,
		role: payload.role,
		email: payload.email,
		password: payload.password,
	};
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

	if (suffix.endsWith("firstName") || suffix.endsWith("name")) {
		return "firstName";
	}

	if (suffix.endsWith("lastName")) {
		return "lastName";
	}

	if (suffix.endsWith("email")) {
		return "email";
	}

	if (suffix.endsWith("role")) {
		return "role";
	}

	if (suffix.endsWith("password")) {
		return "password";
	}

	return undefined;
}

function toFieldErrorEntry(item: BackendValidationError): [keyof AuthFieldErrors, string] | undefined {
	if (!item || typeof item !== "object") {
		return undefined;
	}

	const field = mapBackendPathToField(item.path);
	const message = typeof item.message === "string" ? item.message : undefined;

	if (!field || !message) {
		return undefined;
	}

	return [field, message];
}

function assignCandidateErrors(candidate: unknown, fieldErrors: AuthFieldErrors) {
	if (!Array.isArray(candidate)) {
		return;
	}

	for (const item of candidate as BackendValidationError[]) {
		const entry = toFieldErrorEntry(item);
		if (!entry) {
			continue;
		}

		const [field, message] = entry;
		if (!fieldErrors[field]) {
			fieldErrors[field] = message;
		}
	}
}

function collectFieldErrors(raw: unknown): AuthFieldErrors {
	if (!raw || typeof raw !== "object") {
		return {};
	}

	const body = raw as { errors?: unknown; issues?: unknown; error?: unknown };
	const candidates: unknown[] = [body.errors, body.issues, body.error];
	const fieldErrors: AuthFieldErrors = {};

	for (const candidate of candidates) {
		assignCandidateErrors(candidate, fieldErrors);
	}

	return fieldErrors;
}

export async function signupService(payload: SignUpPayload): Promise<AuthApiResult> {
	const apiBase = getBackendBaseUrl();
	if (!apiBase) {
		return { ok: false, message: "Backend URL is not configured" };
	}

	const normalizedBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;

	const endpoints = [
		`${normalizedBase}/api/v1/auth/register`,
		`${normalizedBase}/api/auth/register`,
		`${normalizedBase}/auth/register`,
	];

	let lastError = "Authentication failed";

	for (const endpoint of endpoints) {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(buildSignUpPayloadForEndpoint(payload, endpoint)),
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

	return { ok: false, message: lastError };
}
