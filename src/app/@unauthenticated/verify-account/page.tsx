import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import VerifyAccount from "../Components/Authentication/VerifyAccount";

type VerifyAccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyAccountPage({
  searchParams,
}: Readonly<VerifyAccountPageProps>) {
  const cookieStore = await cookies();

  const resolvedSearchParams: Record<string, string | string[] | undefined> =
    await (searchParams ?? Promise.resolve({}));
  const emailFromQuery = getSingleQueryParam(resolvedSearchParams.email);
  const emailFromCookie = cookieStore.get("pending_verification_email")?.value;

  const email = emailFromQuery ?? emailFromCookie;

  if (!email) {
    redirect("/login?error=Missing%20verification%20email");
  }

  return (
    <VerifyAccount
      email={email}
      initialOtpExpiresAt={getSingleQueryParam(resolvedSearchParams.otpExpiresAt)}
      initialResendAvailableAt={getSingleQueryParam(resolvedSearchParams.resendAvailableAt)}
    />
  );
}
