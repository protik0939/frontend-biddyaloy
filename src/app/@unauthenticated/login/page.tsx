import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Login from "../Components/Authentication/Login";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

type LoginFieldValues = {
  email?: string;
};

function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: Readonly<LoginPageProps>) {
  const cookieStore = await cookies();
  const hasPendingVerification = cookieStore.get("pending_verification")?.value === "1";
  const pendingEmail = cookieStore.get("pending_verification_email")?.value;

  if (hasPendingVerification) {
    const params = new URLSearchParams();
    if (pendingEmail) {
      params.set("email", pendingEmail);
    }

    const queryString = params.toString();
    redirect(queryString ? `/verify-account?${queryString}` : "/verify-account");
  }

  const currentRole = (cookieStore.get("user_role")?.value ?? "").toUpperCase();

  if (currentRole && currentRole !== "UNAUTHENTICATED") {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getSingleQueryParam(resolvedSearchParams.error);
  const fieldErrors: LoginFieldErrors = {
    email: getSingleQueryParam(resolvedSearchParams.emailError),
    password: getSingleQueryParam(resolvedSearchParams.passwordError),
  };
  const fieldValues: LoginFieldValues = {
    email: getSingleQueryParam(resolvedSearchParams.email),
  };

  return (
    <Login errorMessage={errorMessage} fieldErrors={fieldErrors} fieldValues={fieldValues} />
  )
}
