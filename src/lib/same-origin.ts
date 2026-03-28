const DEFAULT_FRONTEND_ORIGIN = "http://localhost:3000";

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getFrontendOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return normalizeOrigin(
    process.env.FRONTEND_PUBLIC_URL ?? process.env.NEXT_PUBLIC_FRONTEND_URL ?? DEFAULT_FRONTEND_ORIGIN,
  );
}

export function toSameOriginUrl(path: string): string {
  const normalizedPath = normalizePath(path);

  if (typeof window !== "undefined") {
    return normalizedPath;
  }

  return `${getFrontendOrigin()}${normalizedPath}`;
}
