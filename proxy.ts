import { NextRequest, NextResponse } from "next/server";

type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "FACULTY"
  | "DEPARTMENT"
  | "TEACHER"
  | "STUDENT";

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/teacher-apply",
  "/student-apply",
  "/verify-account",
]);

const PRIVATE_ROUTE_PREFIXES = [
  "/admins",
  "/applications",
  "/institutions",
  "/reports",
  "/settings",
  "/profile",
  "/posts",
  "/departments",
  "/department-accounts",
  "/semesters",
  "/batches",
  "/sections",
  "/courses",
  "/students",
  "/teachers",
  "/teacher-applications",
  "/student-applications",
  "/course-registrations",
  "/course-teacher-assignments",
  "/classworks",
  "/attendance",
  "/marks",
  "/registered-courses",
  "/results",
  "/submissions",
  "/fees",
  "/admin",
  "/institution-admin",
];

const SUPERADMIN_ONLY_PREFIXES = ["/admins", "/applications", "/institutions", "/reports", "/settings"];
const ADMIN_ONLY_PREFIXES = ["/admin", "/institution-admin"];

function normalizeRole(roleValue: string | undefined): UserRole | undefined {
  if (!roleValue) {
    return undefined;
  }

  const normalized = roleValue.trim().toUpperCase();

  if (
    normalized === "SUPERADMIN" ||
    normalized === "ADMIN" ||
    normalized === "FACULTY" ||
    normalized === "DEPARTMENT" ||
    normalized === "TEACHER" ||
    normalized === "STUDENT"
  ) {
    return normalized;
  }

  return undefined;
}

function hasSessionToken(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value,
  );
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname);
}

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasToken = hasSessionToken(request);
  const userRole = normalizeRole(request.cookies.get("user_role")?.value);
  const hasPendingVerification = request.cookies.get("pending_verification")?.value === "1";
  const pendingEmail = request.cookies.get("pending_verification_email")?.value;

  if (hasPendingVerification && pathname !== "/verify-account") {
    const verifyUrl = new URL("/verify-account", request.url);
    if (pendingEmail) {
      verifyUrl.searchParams.set("email", pendingEmail);
    }

    return NextResponse.redirect(verifyUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && hasToken) {
    return redirectTo(request, "/");
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isPrivateRoute(pathname)) {
    return NextResponse.next();
  }

  if (!hasToken) {
    return redirectTo(request, "/login");
  }

  if (
    SUPERADMIN_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) &&
    userRole !== "SUPERADMIN"
  ) {
    return redirectTo(request, "/");
  }

  if (
    ADMIN_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) &&
    userRole !== "ADMIN"
  ) {
    return redirectTo(request, "/");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo).*)"],
};
