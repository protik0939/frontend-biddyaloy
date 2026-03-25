"use client";

import ErrorPage from "@/Components/Error/ErrorPage";

export default function SuperAdminError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      title="Super admin workspace unavailable"
      description="We hit a snag while loading the super admin portal. Please try again or return home."
      contextLabel="Super admin"
      error={error}
      reset={reset}
    />
  );
}
