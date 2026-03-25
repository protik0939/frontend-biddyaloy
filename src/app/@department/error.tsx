"use client";

import ErrorPage from "@/Components/Error/ErrorPage";

export default function DepartmentError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      title="Department workspace unavailable"
      description="We hit a snag while loading the department portal. Please try again or return home."
      contextLabel="Department"
      error={error}
      reset={reset}
    />
  );
}
