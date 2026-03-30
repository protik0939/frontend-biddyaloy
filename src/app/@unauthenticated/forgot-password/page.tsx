import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ForgotPassword from "../Components/Authentication/ForgotPassword";

type ForgotPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForgotPasswordPage({
  searchParams,
}: Readonly<ForgotPasswordPageProps>) {
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

  const resolvedSearchParams: Record<string, string | string[] | undefined> =
    await (searchParams ?? Promise.resolve({}));
  const errorMessage = getSingleQueryParam(resolvedSearchParams.error);

  return <ForgotPassword initialError={errorMessage} />;
}
