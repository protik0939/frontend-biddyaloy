"use client";

import ErrorPage from "@/Components/Error/ErrorPage";

export default function StudentError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorPage
      title="Student workspace unavailable"
      description="We hit a snag while loading the student portal. Please try again or return home."
      contextLabel="Student"
      error={error}
      reset={reset}
    />
  );
}
