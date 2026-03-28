import { createAuthClient } from "better-auth/react";

const fallbackOrigin =
    process.env.FRONTEND_PUBLIC_URL ?? process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";

function resolveAuthClientBaseUrl(): string {
    if (globalThis.window === undefined) {
        return fallbackOrigin;
    }

    return globalThis.window.location.origin;
}

export const authClient = createAuthClient({
    baseURL: resolveAuthClientBaseUrl(),
    fetchOptions: {
        credentials: "include",
    },
});