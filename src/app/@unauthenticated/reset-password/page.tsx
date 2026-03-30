import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ResetPassword from "../Components/Authentication/ResetPassword";

type ResetPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({ searchParams }: Readonly<ResetPasswordPageProps>) {
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

  const resolvedSearchParams: Record<string, string | string[] | undefined> =
    await (searchParams ?? Promise.resolve({}));
  const token = getSingleQueryParam(resolvedSearchParams.token);

  if (!token) {
    redirect("/forgot-password?error=Invalid%20or%20expired%20password%20reset%20token");
  }

  return <ResetPassword token={token} />;
}
