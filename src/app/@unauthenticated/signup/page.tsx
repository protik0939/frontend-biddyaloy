import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SignUp from "../Components/Authentication/SignUp";

type SignUpPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type SignUpFieldErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    password?: string;
};

type SignUpFieldValues = {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
};

function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export default async function page({ searchParams }: SignUpPageProps) {
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
    const fieldErrors: SignUpFieldErrors = {
        firstName: getSingleQueryParam(resolvedSearchParams.firstNameError),
        lastName: getSingleQueryParam(resolvedSearchParams.lastNameError),
        email: getSingleQueryParam(resolvedSearchParams.emailError),
        role: getSingleQueryParam(resolvedSearchParams.roleError),
        password: getSingleQueryParam(resolvedSearchParams.passwordError),
    };

    const fieldValues: SignUpFieldValues = {
        firstName: getSingleQueryParam(resolvedSearchParams.firstName),
        lastName: getSingleQueryParam(resolvedSearchParams.lastName),
        email: getSingleQueryParam(resolvedSearchParams.email),
        role: getSingleQueryParam(resolvedSearchParams.role),
    };

    return (
        <SignUp errorMessage={errorMessage} fieldErrors={fieldErrors} fieldValues={fieldValues} />
    )
}
